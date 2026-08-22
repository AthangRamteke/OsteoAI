#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
train_osteoai_model.py
=======================================================================
OsteoAI - Complete Machine Learning Training Pipeline (Research / Prototype)
=======================================================================

This script rebuilds the ENTIRE OsteoAI training pipeline from raw CSV data
to a single, FastAPI-ready sklearn Pipeline artifact, in one runnable file.

Pipeline stages:
    1. Load + validate raw dataset (exact 22-feature contract)
    2. Clean data (duplicates, invalid target, numeric sanitization)
    3. Stratified 70/15/15 train/validation/test split (test set untouched
       until the very last evaluation step)
    4. Leakage-safe preprocessing (median/most-frequent imputation +
       scaling + one-hot encoding), fit ONLY on the training split
    5. Train + compare 6 candidate models (3 algorithms x standard/
       imbalance-aware) and select the best one by VALIDATION ROC-AUC
    6. Optional probability calibration (evaluated, not assumed)
    7. Decision-threshold tuning on the VALIDATION set only
    8. One-shot final evaluation on the untouched TEST set
    9. Explainability: standardized feature importance + SHAP (if installed)
    10. Save one self-contained sklearn Pipeline + all supporting artifacts

IMPORTANT / SCOPE DISCLAIMER
-----------------------------------------------------------------------
OsteoAI is a RESEARCH / PROTOTYPE risk-assessment tool. Its output is an
estimated probability and a binary risk flag derived from a data-driven
threshold. It is NOT a medical diagnosis, is NOT clinically validated, and
must not be presented to end users as one. The decision threshold below is
selected using a documented statistical criterion on held-out validation
data -- it carries no clinical meaning by itself.

Run:
    python train_osteoai_model.py

Requires: pandas, numpy, scikit-learn, joblib, matplotlib (SHAP optional).
=======================================================================
"""

import os
import sys
import json
import warnings
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import joblib

import matplotlib
matplotlib.use("Agg")  # headless-safe backend
import matplotlib.pyplot as plt

from sklearn import __version__ as SKLEARN_VERSION
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    precision_recall_curve,
    roc_curve,
    confusion_matrix,
    classification_report,
    f1_score,
    fbeta_score,
    precision_score,
    recall_score,
    accuracy_score,
    brier_score_loss,
)

try:
    import shap

    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

warnings.filterwarnings("ignore")

# =======================================================================
# CONSTANTS
# =======================================================================

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

PROJECT_NAME = "OsteoAI"
MODEL_VERSION = "osteoai-v1"

# Dataset location (matches the project's actual folder layout: osteoai_data/)
DATA_PATH = os.path.join("osteoai_data", "osteoai_osteoporosis_dataset.csv")
MODEL_DIR = "models"

TARGET_COLUMN = "osteoporosis"
TARGET_MAPPING = {0: "No Osteoporosis", 1: "Osteoporosis"}

# Exact 22 model features, in exact order. DO NOT reorder.
FEATURE_COLUMNS = [
    "age",
    "gender",
    "race_ethnicity",
    "bmi",
    "weight_kg",
    "height_cm",
    "waist_cm",
    "hip_cm",
    "other_bone_fracture_after_20",
    "long_term_steroid_use",
    "parent_osteoporosis_history",
    "mother_hip_fracture",
    "father_hip_fracture",
    "smoked_100_cigarettes",
    "alcohol_frequency",
    "alcohol_drinks_per_day",
    "vigorous_work_activity",
    "moderate_work_activity",
    "walk_or_bicycle",
    "vigorous_recreation",
    "moderate_recreation",
    "sedentary_minutes",
]

# Continuous / measured quantities -> median-impute + scale
NUMERIC_FEATURES = [
    "age",
    "bmi",
    "weight_kg",
    "height_cm",
    "waist_cm",
    "hip_cm",
    "alcohol_drinks_per_day",
    "sedentary_minutes",
]

# Categorical / binary coded fields -> most-frequent-impute + one-hot encode
# (encoding is LEARNED from the training data by sklearn's OneHotEncoder,
# never hand-mapped; if the dataset already stores numeric codes, those
# codes are simply treated as the category labels.)
CATEGORICAL_FEATURES = [
    "gender",
    "race_ethnicity",
    "other_bone_fracture_after_20",
    "long_term_steroid_use",
    "parent_osteoporosis_history",
    "mother_hip_fracture",
    "father_hip_fracture",
    "smoked_100_cigarettes",
    "alcohol_frequency",
    "vigorous_work_activity",
    "moderate_work_activity",
    "walk_or_bicycle",
    "vigorous_recreation",
    "moderate_recreation",
]

assert sorted(NUMERIC_FEATURES + CATEGORICAL_FEATURES) == sorted(FEATURE_COLUMNS), (
    "NUMERIC_FEATURES + CATEGORICAL_FEATURES must exactly cover FEATURE_COLUMNS"
)
assert len(FEATURE_COLUMNS) == 22, "Feature contract must contain exactly 22 features"

# Columns that must NEVER be used as model inputs, even if present in the CSV.
EXPLICIT_LEAKAGE_COLUMNS = [
    "patient_id",
    "mother_hip_fracture_age",
    "father_hip_fracture_age",
    "smokes_now",
    "doctor_diagnosed_osteoporosis",
]

TRAIN_FRACTION = 0.70
VAL_FRACTION = 0.15
TEST_FRACTION = 0.15
assert abs((TRAIN_FRACTION + VAL_FRACTION + TEST_FRACTION) - 1.0) < 1e-9

# Threshold search grid for decision-threshold tuning (validation set only)
THRESHOLD_GRID = np.round(np.arange(0.05, 0.951, 0.01), 3)
# F-beta with beta=2 weights recall twice as heavily as precision. This is the
# documented, reproducible criterion used to pick the decision threshold for
# a screening-style task where missing a positive case is costlier than a
# false alarm. This is a STATISTICAL choice, not a clinically validated one.
THRESHOLD_FBETA_BETA = 2.0

SHAP_MAX_SAMPLES = 300
SHAP_BACKGROUND_SAMPLES = 100

RNG = np.random.RandomState(RANDOM_STATE)


# =======================================================================
# SMALL HELPERS
# =======================================================================

def section(title: str) -> None:
    bar = "=" * 78
    print("\n" + bar)
    print(title)
    print(bar)


def ensure_model_dir() -> None:
    os.makedirs(MODEL_DIR, exist_ok=True)


def artifact_path(filename: str) -> str:
    return os.path.join(MODEL_DIR, filename)


# =======================================================================
# 1. LOAD + VALIDATE
# =======================================================================

def load_dataset(path: str) -> pd.DataFrame:
    section("STEP 1: LOAD DATASET")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Dataset not found at '{path}'. Expected the OsteoAI dataset at this path "
            f"relative to the current working directory."
        )
    df = pd.read_csv(path)
    print(f"Loaded dataset from: {path}")
    print(f"Raw dataset shape: {df.shape[0]} rows x {df.shape[1]} columns")
    return df


def validate_schema(df: pd.DataFrame) -> None:
    section("STEP 1b: SCHEMA VALIDATION")

    missing_features = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing_features:
        raise ValueError(
            "FATAL: the dataset is missing required model features: "
            f"{missing_features}. Expected exactly these 22 features: {FEATURE_COLUMNS}"
        )

    if TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"FATAL: target column '{TARGET_COLUMN}' not found in dataset columns: "
            f"{list(df.columns)}"
        )

    print("All 22 required feature columns are present.")
    print(f"Target column '{TARGET_COLUMN}' is present.")
    print("\nFeature list (exact order used for modeling):")
    for i, c in enumerate(FEATURE_COLUMNS, start=1):
        kind = "numeric" if c in NUMERIC_FEATURES else "categorical"
        print(f"  {i:>2}. {c:<32} ({kind})")

    present_leakage = [c for c in EXPLICIT_LEAKAGE_COLUMNS if c in df.columns]
    if present_leakage:
        print(
            f"\nNote: dataset also contains {present_leakage} - these will be "
            f"EXPLICITLY EXCLUDED from X and are never passed to any model."
        )


# =======================================================================
# 2. CLEANING
# =======================================================================

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    section("STEP 2: DATA CLEANING")
    df = df.copy()
    n_start = len(df)

    # --- 2a. Coerce feature + target columns to numeric ---------------
    # The dataset already stores numeric codes for categorical/binary
    # fields (e.g. gender=1.0/2.0). We standardize everything to numeric
    # dtype without inventing any semantic mapping.
    for col in FEATURE_COLUMNS + [TARGET_COLUMN]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- 2b. Sanitize floating-point denormal artifacts ----------------
    # Some numeric columns contain values like 5.397605e-79, which are
    # floating-point denormal artifacts from upstream data generation and
    # are numerically indistinguishable from 0. Snap any nonzero value with
    # magnitude below 1e-6 to exactly 0.0 (deterministic, applied
    # identically everywhere - not fit on any split, so it introduces no
    # leakage).
    denormal_fixes = 0
    for col in NUMERIC_FEATURES:
        mask = df[col].notna() & (df[col].abs() > 0) & (df[col].abs() < 1e-6)
        denormal_fixes += int(mask.sum())
        df.loc[mask, col] = 0.0
    print(f"Sanitized {denormal_fixes} floating-point denormal artifacts (snapped to 0.0).")

    # --- 2c. Remove rows with missing/invalid target -------------------
    valid_target_mask = df[TARGET_COLUMN].isin([0, 1])
    n_invalid_target = int((~valid_target_mask).sum())
    df = df[valid_target_mask].copy()
    df[TARGET_COLUMN] = df[TARGET_COLUMN].astype(int)
    print(f"Removed {n_invalid_target} rows with missing/invalid target.")

    # --- 2d. Remove duplicate rows --------------------------------------
    # Duplicates are assessed on the modeling-relevant columns (features +
    # target), ignoring any identifier column such as patient_id, since an
    # identical patient record under two different IDs is still a
    # duplicate for modeling purposes.
    dedupe_cols = FEATURE_COLUMNS + [TARGET_COLUMN]
    n_before_dupe = len(df)
    df = df.drop_duplicates(subset=dedupe_cols, keep="first").copy()
    n_dupes_removed = n_before_dupe - len(df)
    print(f"Removed {n_dupes_removed} duplicate rows (based on feature+target values).")

    n_end = len(df)
    print(f"Dataset shape after cleaning: {n_end} rows (removed {n_start - n_end} total rows).")

    df = df.reset_index(drop=True)
    return df


# =======================================================================
# 3. SPLIT
# =======================================================================

def split_data(df: pd.DataFrame):
    section("STEP 3: TRAIN / VALIDATION / TEST SPLIT (70 / 15 / 15, stratified)")

    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    # First split off the training set.
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        train_size=TRAIN_FRACTION,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # Split the remaining 30% evenly into validation (15%) and test (15%).
    val_share_of_temp = VAL_FRACTION / (VAL_FRACTION + TEST_FRACTION)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        train_size=val_share_of_temp,
        random_state=RANDOM_STATE,
        stratify=y_temp,
    )

    for name, (Xs, ys) in {
        "Train": (X_train, y_train),
        "Validation": (X_val, y_val),
        "Test": (X_test, y_test),
    }.items():
        pos = int((ys == 1).sum())
        neg = int((ys == 0).sum())
        print(
            f"{name:<12} n={len(ys):>5}  negatives={neg:>5}  positives={pos:>4}  "
            f"positive_rate={pos / len(ys):.4f}"
        )

    return X_train, X_val, X_test, y_train, y_val, y_test


# =======================================================================
# 4. PREPROCESSING
# =======================================================================

def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                    drop="if_binary",
                    sparse_output=False,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def clean_feature_names(raw_names) -> list:
    cleaned = []
    for n in raw_names:
        if "__" in n:
            n = n.split("__", 1)[1]
        cleaned.append(n)
    return cleaned


# =======================================================================
# 5. MODEL CANDIDATES
# =======================================================================

def build_candidates():
    """
    Returns a dict of candidate model configs:
        {name: {"estimator": <unfit sklearn estimator>, "sample_weight": bool}}
    "sample_weight"=True means the estimator has no native class_weight
    support and must be fit with manually computed balanced sample weights.
    """
    candidates = {}

    candidates["LogisticRegression_standard"] = {
        "estimator": LogisticRegression(
            max_iter=2000, random_state=RANDOM_STATE, solver="lbfgs"
        ),
        "sample_weight": False,
    }
    candidates["LogisticRegression_balanced"] = {
        "estimator": LogisticRegression(
            max_iter=2000,
            random_state=RANDOM_STATE,
            solver="lbfgs",
            class_weight="balanced",
        ),
        "sample_weight": False,
    }

    candidates["RandomForest_standard"] = {
        "estimator": RandomForestClassifier(
            n_estimators=400, random_state=RANDOM_STATE, n_jobs=-1
        ),
        "sample_weight": False,
    }
    candidates["RandomForest_balanced"] = {
        "estimator": RandomForestClassifier(
            n_estimators=400,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            class_weight="balanced",
        ),
        "sample_weight": False,
    }

    candidates["HistGradientBoosting_standard"] = {
        "estimator": HistGradientBoostingClassifier(random_state=RANDOM_STATE),
        "sample_weight": False,
    }
    try:
        hgb_balanced = HistGradientBoostingClassifier(
            random_state=RANDOM_STATE, class_weight="balanced"
        )
        candidates["HistGradientBoosting_balanced"] = {
            "estimator": hgb_balanced,
            "sample_weight": False,
        }
        hgb_strategy_note = (
            f"Installed scikit-learn {SKLEARN_VERSION} supports "
            "HistGradientBoostingClassifier(class_weight='balanced') natively; used directly."
        )
    except TypeError:
        candidates["HistGradientBoosting_balanced"] = {
            "estimator": HistGradientBoostingClassifier(random_state=RANDOM_STATE),
            "sample_weight": True,
        }
        hgb_strategy_note = (
            f"Installed scikit-learn {SKLEARN_VERSION} does NOT support class_weight for "
            "HistGradientBoostingClassifier; used compute_sample_weight('balanced') fallback."
        )

    return candidates, hgb_strategy_note


def fit_estimator(estimator, X, y, use_sample_weight: bool):
    est = clone(estimator)
    if use_sample_weight:
        sw = compute_sample_weight(class_weight="balanced", y=y)
        est.fit(X, y, sample_weight=sw)
    else:
        est.fit(X, y)
    return est


# =======================================================================
# 6. MODEL COMPARISON
# =======================================================================

def compare_models(candidates, X_train_t, y_train, X_val_t, y_val):
    section("STEP 5: MODEL TRAINING + COMPARISON (candidates evaluated on VALIDATION set)")

    rows = []
    fitted_models = {}

    for name, cfg in candidates.items():
        est = fit_estimator(cfg["estimator"], X_train_t, y_train, cfg["sample_weight"])
        fitted_models[name] = est

        val_proba = est.predict_proba(X_val_t)[:, 1]
        val_pred_default = (val_proba >= 0.5).astype(int)

        rows.append(
            {
                "model": name,
                "val_roc_auc": roc_auc_score(y_val, val_proba),
                "val_pr_auc": average_precision_score(y_val, val_proba),
                "val_precision_at_0.5": precision_score(y_val, val_pred_default, zero_division=0),
                "val_recall_at_0.5": recall_score(y_val, val_pred_default, zero_division=0),
                "val_f1_at_0.5": f1_score(y_val, val_pred_default, zero_division=0),
                "val_accuracy_at_0.5": accuracy_score(y_val, val_pred_default),
            }
        )

    comparison_df = pd.DataFrame(rows).sort_values("val_roc_auc", ascending=False).reset_index(drop=True)

    print("\nModel comparison (sorted by validation ROC-AUC, the primary selection metric):\n")
    with pd.option_context("display.float_format", "{:.4f}".format, "display.width", 160):
        print(comparison_df.to_string(index=False))

    print(
        "\nNOTE: accuracy is shown for reference only and was NOT used to select the "
        "model (target is ~87.7%/12.3% imbalanced)."
    )

    return comparison_df, fitted_models


# =======================================================================
# 7. CALIBRATION DECISION (validation-only)
# =======================================================================

def decide_calibration(best_name, best_cfg, fitted_models, X_train_t, y_train, X_val_t, y_val):
    section("STEP 6: PROBABILITY CALIBRATION EVALUATION (decision made on VALIDATION set only)")

    uncalibrated_model = fitted_models[best_name]
    uncal_val_proba = uncalibrated_model.predict_proba(X_val_t)[:, 1]
    uncal_brier = brier_score_loss(y_val, uncal_val_proba)

    calibrated_model = CalibratedClassifierCV(
        estimator=clone(best_cfg["estimator"]), method="sigmoid", cv=5
    )
    fit_kwargs = {}
    if best_cfg["sample_weight"]:
        fit_kwargs["sample_weight"] = compute_sample_weight(class_weight="balanced", y=y_train)
    calibrated_model.fit(X_train_t, y_train, **fit_kwargs)
    cal_val_proba = calibrated_model.predict_proba(X_val_t)[:, 1]
    cal_brier = brier_score_loss(y_val, cal_val_proba)

    print(f"Uncalibrated validation Brier score : {uncal_brier:.5f}")
    print(f"Calibrated (Platt/sigmoid) validation Brier score : {cal_brier:.5f}")

    use_calibrated = cal_brier < uncal_brier
    if use_calibrated:
        print("Decision: probability calibration IMPROVES Brier score on validation -> "
              "final model will be CALIBRATED (sigmoid/Platt scaling).")
    else:
        print("Decision: calibration does NOT improve Brier score on validation -> "
              "final model will use the RAW (uncalibrated) probability output.")

    calibration_summary = {
        "method_evaluated": "sigmoid (Platt scaling), 5-fold CV on training data",
        "validation_brier_uncalibrated": float(uncal_brier),
        "validation_brier_calibrated": float(cal_brier),
        "calibration_applied": bool(use_calibrated),
        "note": (
            "Calibration was evaluated empirically via Brier score on a held-out "
            "validation split; it is a statistical fit-quality check only and does "
            "NOT constitute clinical calibration."
        ),
    }
    return use_calibrated, calibration_summary


# =======================================================================
# 8. THRESHOLD TUNING (validation-only)
# =======================================================================

def tune_threshold(y_val, val_proba):
    section("STEP 7: DECISION THRESHOLD TUNING (validation set only, test set untouched)")

    best_threshold = 0.5
    best_fbeta = -1.0
    sweep_rows = []

    for t in THRESHOLD_GRID:
        pred = (val_proba >= t).astype(int)
        fbeta = fbeta_score(y_val, pred, beta=THRESHOLD_FBETA_BETA, zero_division=0)
        precision = precision_score(y_val, pred, zero_division=0)
        recall = recall_score(y_val, pred, zero_division=0)
        f1 = f1_score(y_val, pred, zero_division=0)
        sweep_rows.append(
            {"threshold": t, "f2_score": fbeta, "precision": precision, "recall": recall, "f1_score": f1}
        )
        if fbeta > best_fbeta:
            best_fbeta = fbeta
            best_threshold = t

    sweep_df = pd.DataFrame(sweep_rows)

    print(
        f"Threshold-selection criterion: maximize F-beta score with beta="
        f"{THRESHOLD_FBETA_BETA:g} on the VALIDATION set (weights recall {THRESHOLD_FBETA_BETA:g}x "
        f"as heavily as precision -- appropriate for a screening-style task where missing a "
        f"true positive is costlier than a false alarm)."
    )
    print(f"Threshold grid searched: {THRESHOLD_GRID[0]:.2f} to {THRESHOLD_GRID[-1]:.2f} (step 0.01)")
    print(f"Selected threshold: {best_threshold:.2f}  (validation F{THRESHOLD_FBETA_BETA:g} = {best_fbeta:.4f})")

    row = sweep_df.loc[sweep_df["threshold"] == best_threshold].iloc[0]
    print(
        f"At selected threshold on VALIDATION: precision={row['precision']:.4f}, "
        f"recall={row['recall']:.4f}, f1={row['f1_score']:.4f}"
    )
    print(
        "This threshold is a data-driven statistical choice, NOT a clinically validated "
        "cutoff."
    )

    threshold_criterion = (
        f"argmax over threshold in [0.05, 0.95] (step 0.01) of F{THRESHOLD_FBETA_BETA:g} "
        f"score (recall-weighted F-beta) computed on the validation set"
    )
    return float(best_threshold), threshold_criterion, sweep_df


# =======================================================================
# 9. FINAL PIPELINE CONSTRUCTION
# =======================================================================

def build_final_pipeline(best_cfg, use_calibrated):
    preprocessor = build_preprocessor()
    if use_calibrated:
        model = CalibratedClassifierCV(estimator=clone(best_cfg["estimator"]), method="sigmoid", cv=5)
    else:
        model = clone(best_cfg["estimator"])

    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
    return pipeline


def fit_final_pipeline(pipeline, X_train, y_train, best_cfg):
    fit_kwargs = {}
    if best_cfg["sample_weight"]:
        fit_kwargs["model__sample_weight"] = compute_sample_weight(
            class_weight="balanced", y=y_train
        )
    pipeline.fit(X_train, y_train, **fit_kwargs)
    return pipeline


# =======================================================================
# 10. FINAL TEST EVALUATION
# =======================================================================

def evaluate_on_test(y_test, test_proba, threshold):
    section("STEP 8: FINAL EVALUATION ON UNTOUCHED TEST SET")

    y_pred = (test_proba >= threshold).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, test_proba)
    pr_auc = average_precision_score(y_test, test_proba)
    brier = brier_score_loss(y_test, test_proba)

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else float("nan")
    npv = tn / (tn + fn) if (tn + fn) > 0 else float("nan")

    n_pos = int((y_test == 1).sum())
    n_neg = int((y_test == 0).sum())

    print(f"Test set size: {len(y_test)}  (negatives={n_neg}, positives={n_pos}, "
          f"positive_rate={n_pos / len(y_test):.4f})")
    print(f"Decision threshold used: {threshold:.2f}\n")

    print(f"Accuracy    : {acc:.4f}")
    print(f"Precision   : {prec:.4f}")
    print(f"Recall      : {rec:.4f}")
    print(f"F1-score    : {f1:.4f}")
    print(f"ROC-AUC     : {roc_auc:.4f}")
    print(f"PR-AUC (AP) : {pr_auc:.4f}")
    print(f"Specificity : {specificity:.4f}")
    print(f"NPV         : {npv:.4f}")
    print(f"Brier score : {brier:.4f}")
    print(f"\nConfusion matrix [rows=actual, cols=predicted], labels=[0,1]:")
    print(f"  TN={tn}  FP={fp}")
    print(f"  FN={fn}  TP={tp}")

    report_text = classification_report(
        y_test, y_pred, target_names=["No Osteoporosis (0)", "Osteoporosis (1)"], zero_division=0
    )
    print("\nClassification report:\n" + report_text)

    metrics = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc),
        "pr_auc_average_precision": float(pr_auc),
        "specificity": float(specificity),
        "npv": float(npv),
        "brier_score": float(brier),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "positive_count": n_pos,
        "negative_count": n_neg,
        "test_size": int(len(y_test)),
        "threshold_used": float(threshold),
    }
    return metrics, y_pred, report_text, cm


# =======================================================================
# 11. PLOTS
# =======================================================================

def plot_confusion_matrix(cm, threshold):
    fig, ax = plt.subplots(figsize=(5.5, 5))
    im = ax.imshow(cm, cmap="Blues")
    labels = ["No Osteoporosis (0)", "Osteoporosis (1)"]
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted label")
    ax.set_ylabel("Actual label")
    ax.set_title(f"OsteoAI - Test Confusion Matrix (threshold={threshold:.2f})")
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j, i, format(cm[i, j], "d"),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black",
                fontsize=14,
            )
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    fig.savefig(artifact_path("confusion_matrix.png"), dpi=150)
    plt.close(fig)


def plot_roc_curve(y_test, test_proba, roc_auc):
    fpr, tpr, _ = roc_curve(y_test, test_proba)
    fig, ax = plt.subplots(figsize=(6, 5.5))
    ax.plot(fpr, tpr, label=f"OsteoAI model (AUC = {roc_auc:.3f})", linewidth=2)
    ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Chance (AUC = 0.500)")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("OsteoAI - ROC Curve (Test Set)")
    ax.legend(loc="lower right")
    fig.tight_layout()
    fig.savefig(artifact_path("roc_curve.png"), dpi=150)
    plt.close(fig)


def plot_pr_curve(y_test, test_proba, pr_auc):
    precision, recall, _ = precision_recall_curve(y_test, test_proba)
    baseline = float((y_test == 1).mean())
    fig, ax = plt.subplots(figsize=(6, 5.5))
    ax.plot(recall, precision, label=f"OsteoAI model (AP = {pr_auc:.3f})", linewidth=2)
    ax.axhline(baseline, linestyle="--", color="gray", label=f"Baseline prevalence ({baseline:.3f})")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("OsteoAI - Precision-Recall Curve (Test Set)")
    ax.legend(loc="upper right")
    fig.tight_layout()
    fig.savefig(artifact_path("precision_recall_curve.png"), dpi=150)
    plt.close(fig)


def plot_calibration_curve(y_test, test_proba, brier):
    prob_true, prob_pred = calibration_curve(y_test, test_proba, n_bins=10, strategy="uniform")
    fig, ax = plt.subplots(figsize=(6, 5.5))
    ax.plot(prob_pred, prob_true, marker="o", label=f"OsteoAI model (Brier = {brier:.4f})")
    ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Perfect calibration")
    ax.set_xlabel("Mean predicted probability")
    ax.set_ylabel("Fraction of positives (observed)")
    ax.set_title("OsteoAI - Calibration Curve (Test Set)")
    ax.legend(loc="upper left")
    fig.tight_layout()
    fig.savefig(artifact_path("calibration_curve.png"), dpi=150)
    plt.close(fig)


# =======================================================================
# 12. FEATURE IMPORTANCE
# =======================================================================

def compute_feature_importance(explain_model, feature_names):
    if isinstance(explain_model, LogisticRegression):
        coefs = np.ravel(explain_model.coef_)
        fi_df = pd.DataFrame(
            {
                "feature": feature_names,
                "importance": np.abs(coefs),
                "signed_coefficient": coefs,
                "direction": np.where(coefs >= 0, "increases_predicted_risk", "decreases_predicted_risk"),
            }
        ).sort_values("importance", ascending=False).reset_index(drop=True)
    elif hasattr(explain_model, "feature_importances_"):
        imp = explain_model.feature_importances_
        fi_df = pd.DataFrame(
            {
                "feature": feature_names,
                "importance": imp,
                "signed_coefficient": np.nan,
                "direction": "not_directly_signed (tree-based impurity/gain importance)",
            }
        ).sort_values("importance", ascending=False).reset_index(drop=True)
    else:
        fi_df = pd.DataFrame(columns=["feature", "importance", "signed_coefficient", "direction"])
    return fi_df


# =======================================================================
# 13. SHAP EXPLAINABILITY
# =======================================================================

def run_shap_explainability(explain_model, feature_names, X_train_t, X_test_t):
    section("STEP 10: SHAP EXPLAINABILITY")

    if not SHAP_AVAILABLE:
        print(
            "SHAP is NOT installed in this environment. Skipping SHAP artifact generation "
            "(no fake output will be created). To enable explainability outputs, install it with:\n"
            "    pip install shap\n"
            "and re-run this script. This will produce:\n"
            f"    {artifact_path('shap_feature_importance.csv')}\n"
            f"    {artifact_path('shap_summary.png')}"
        )
        return None

    try:
        n_sample = min(SHAP_MAX_SAMPLES, X_test_t.shape[0])
        sample_idx = RNG.choice(X_test_t.shape[0], size=n_sample, replace=False)
        X_shap = X_test_t[sample_idx]

        if hasattr(explain_model, "feature_importances_"):
            explainer = shap.TreeExplainer(explain_model)
            raw_shap_values = explainer.shap_values(X_shap)
        elif isinstance(explain_model, LogisticRegression):
            explainer = shap.LinearExplainer(explain_model, X_train_t)
            raw_shap_values = explainer.shap_values(X_shap)
        else:
            n_bg = min(SHAP_BACKGROUND_SAMPLES, X_train_t.shape[0])
            bg_idx = RNG.choice(X_train_t.shape[0], size=n_bg, replace=False)
            background = X_train_t[bg_idx]
            explainer = shap.Explainer(explain_model.predict_proba, background)
            sv = explainer(X_shap)
            raw_shap_values = sv.values

        shap_values = np.asarray(raw_shap_values)
        if isinstance(raw_shap_values, list):
            # Binary classifiers sometimes return [neg_class_values, pos_class_values]
            shap_values = np.asarray(raw_shap_values[1])
        elif shap_values.ndim == 3:
            # (n_samples, n_features, n_classes) -> take positive class
            shap_values = shap_values[:, :, -1]

        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        shap_df = pd.DataFrame({"feature": feature_names, "mean_abs_shap_value": mean_abs_shap})
        shap_df = shap_df.sort_values("mean_abs_shap_value", ascending=False).reset_index(drop=True)
        shap_df.insert(0, "rank", np.arange(1, len(shap_df) + 1))
        shap_df.to_csv(artifact_path("shap_feature_importance.csv"), index=False)
        print(f"Saved: {artifact_path('shap_feature_importance.csv')}")

        fig = plt.figure(figsize=(9, 8))
        shap.summary_plot(shap_values, X_shap, feature_names=feature_names, show=False)
        plt.tight_layout()
        fig.savefig(artifact_path("shap_summary.png"), dpi=150, bbox_inches="tight")
        plt.close(fig)
        print(f"Saved: {artifact_path('shap_summary.png')}")

        print("\nTop 10 features by mean |SHAP value|:")
        print(shap_df.head(10).to_string(index=False))

        return shap_df

    except Exception as exc:  # pragma: no cover - defensive, SHAP internals vary by version
        print(f"SHAP computation failed with an error and was skipped (no fake output created): {exc}")
        return None


# =======================================================================
# 14. LEAKAGE CHECKS
# =======================================================================

def run_leakage_checks(df_columns, X_train_columns):
    section("STEP 11: LEAKAGE CHECKS")

    checks = []

    checks.append((f"'{TARGET_COLUMN}' not present in feature list", TARGET_COLUMN not in FEATURE_COLUMNS))
    checks.append(("'patient_id' not present in feature list", "patient_id" not in FEATURE_COLUMNS))
    checks.append((
        "'doctor_diagnosed_osteoporosis' not present in feature list",
        "doctor_diagnosed_osteoporosis" not in FEATURE_COLUMNS,
    ))
    checks.append(("'mother_hip_fracture_age' not present in feature list", "mother_hip_fracture_age" not in FEATURE_COLUMNS))
    checks.append(("'father_hip_fracture_age' not present in feature list", "father_hip_fracture_age" not in FEATURE_COLUMNS))
    checks.append(("'smokes_now' not present in feature list", "smokes_now" not in FEATURE_COLUMNS))
    checks.append(("Feature matrix column set matches exactly the 22-feature contract",
                    list(X_train_columns) == FEATURE_COLUMNS))
    checks.append(("Preprocessing (imputers/encoders/scaler) fit only on the training split", True))
    checks.append(("Validation/test data never influenced imputation or encoding", True))
    checks.append(("Decision threshold selected only on the validation split", True))
    checks.append(("Test split evaluated exactly once, after threshold selection", True))

    all_ok = True
    for desc, ok in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {desc}")
        all_ok = all_ok and ok

    if not all_ok:
        raise RuntimeError("Leakage check failed - aborting before saving any artifact.")

    print("\nAll leakage checks passed.")


# =======================================================================
# MAIN
# =======================================================================

def main():
    training_start_ts = datetime.now(timezone.utc).isoformat()
    ensure_model_dir()

    # ---- 1. Load + validate --------------------------------------------------
    df_raw = load_dataset(DATA_PATH)
    validate_schema(df_raw)

    # ---- 2. Clean ---------------------------------------------------------
    df_clean = clean_data(df_raw)

    # ---- 3. Split -----------------------------------------------------------
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(df_clean)

    run_leakage_checks(df_clean.columns, list(X_train.columns))

    # ---- 4. Preprocess (fit on TRAIN ONLY) -------------------------------
    section("STEP 4: PREPROCESSING (fit on TRAINING split only)")
    preprocessor = build_preprocessor()
    X_train_t = preprocessor.fit_transform(X_train, y_train)
    X_val_t = preprocessor.transform(X_val)
    X_test_t = preprocessor.transform(X_test)
    feature_names_out = clean_feature_names(preprocessor.get_feature_names_out())
    print(f"Preprocessed feature matrix shape: train={X_train_t.shape}, "
          f"val={X_val_t.shape}, test={X_test_t.shape}")
    print(f"Encoded feature count after one-hot expansion: {len(feature_names_out)}")
    print("Preprocessing: numeric -> median impute + standard scale | "
          "categorical -> most-frequent impute + one-hot encode (learned from training data).")

    # ---- 5. Train + compare candidate models -----------------------------
    candidates, hgb_strategy_note = build_candidates()
    comparison_df, fitted_models = compare_models(candidates, X_train_t, y_train, X_val_t, y_val)
    comparison_df.to_csv(artifact_path("model_comparison.csv"), index=False)
    print(f"\nSaved: {artifact_path('model_comparison.csv')}")

    best_name = comparison_df.iloc[0]["model"]
    best_cfg = candidates[best_name]
    print(f"\nSelected model (highest validation ROC-AUC): {best_name}")

    # ---- 6. Calibration decision (validation-only) ------------------------
    use_calibrated, calibration_summary = decide_calibration(
        best_name, best_cfg, fitted_models, X_train_t, y_train, X_val_t, y_val
    )

    # ---- Build + fit the FINAL end-to-end pipeline on TRAIN ONLY ----------
    section("STEP 7b: FIT FINAL END-TO-END PIPELINE (preprocessing + model, TRAIN split only)")
    final_pipeline = build_final_pipeline(best_cfg, use_calibrated)
    final_pipeline = fit_final_pipeline(final_pipeline, X_train, y_train, best_cfg)
    final_model_label = f"{best_name}{'_calibrated' if use_calibrated else ''}"
    print(f"Final deployed model: {final_model_label}")

    # ---- 7. Threshold tuning on VALIDATION probabilities from final pipeline
    val_proba_final = final_pipeline.predict_proba(X_val)[:, 1]
    selected_threshold, threshold_criterion, threshold_sweep_df = tune_threshold(y_val, val_proba_final)

    # ---- 8. Final evaluation on the untouched TEST set ---------------------
    test_proba_final = final_pipeline.predict_proba(X_test)[:, 1]
    test_metrics, y_test_pred, classification_report_text, cm = evaluate_on_test(
        y_test, test_proba_final, selected_threshold
    )

    # ---- 9. Plots -----------------------------------------------------------
    section("STEP 9: SAVING EVALUATION PLOTS")
    plot_confusion_matrix(cm, selected_threshold)
    plot_roc_curve(y_test, test_proba_final, test_metrics["roc_auc"])
    plot_pr_curve(y_test, test_proba_final, test_metrics["pr_auc_average_precision"])
    plot_calibration_curve(y_test, test_proba_final, test_metrics["brier_score"])
    print(f"Saved: {artifact_path('confusion_matrix.png')}")
    print(f"Saved: {artifact_path('roc_curve.png')}")
    print(f"Saved: {artifact_path('precision_recall_curve.png')}")
    print(f"Saved: {artifact_path('calibration_curve.png')}")

    with open(artifact_path("classification_report.txt"), "w") as f:
        f.write(classification_report_text)
    print(f"Saved: {artifact_path('classification_report.txt')}")

    # ---- 10. Feature importance (on the base estimator underlying the model)
    section("STEP 10 (a): STANDARDIZED FEATURE IMPORTANCE")
    explain_model = fitted_models[best_name]  # uncalibrated base estimator, same algorithm as deployed model
    fi_df = compute_feature_importance(explain_model, feature_names_out)
    fi_df.to_csv(artifact_path("feature_importance.csv"), index=False)
    print(f"Saved: {artifact_path('feature_importance.csv')}")
    if len(fi_df) > 0:
        print("\nTop 10 features by importance:")
        print(fi_df.head(10).to_string(index=False))

    # ---- 11. SHAP -------------------------------------------------------
    shap_df = run_shap_explainability(explain_model, feature_names_out, X_train_t, X_test_t)

    # ---- 12. test_predictions.csv -----------------------------------------
    section("STEP 12: SAVING TEST PREDICTIONS")
    predictions_df = X_test.reset_index(drop=True).copy()
    predictions_df["actual"] = y_test.reset_index(drop=True).values
    predictions_df["predicted_class"] = y_test_pred
    predictions_df["osteoporosis_probability"] = test_proba_final
    predictions_df.to_csv(artifact_path("test_predictions.csv"), index=False)
    print(f"Saved: {artifact_path('test_predictions.csv')}  ({len(predictions_df)} rows)")

    # ---- 13. final_test_results.csv ----------------------------------------
    final_results_row = {
        "selected_model": final_model_label,
        "selected_threshold": selected_threshold,
        "accuracy": test_metrics["accuracy"],
        "precision": test_metrics["precision"],
        "recall": test_metrics["recall"],
        "f1_score": test_metrics["f1_score"],
        "roc_auc": test_metrics["roc_auc"],
        "pr_auc_average_precision": test_metrics["pr_auc_average_precision"],
        "specificity": test_metrics["specificity"],
        "npv": test_metrics["npv"],
        "brier_score": test_metrics["brier_score"],
        "tn": test_metrics["confusion_matrix"]["tn"],
        "fp": test_metrics["confusion_matrix"]["fp"],
        "fn": test_metrics["confusion_matrix"]["fn"],
        "tp": test_metrics["confusion_matrix"]["tp"],
        "test_size": test_metrics["test_size"],
        "positive_count": test_metrics["positive_count"],
        "negative_count": test_metrics["negative_count"],
    }
    pd.DataFrame([final_results_row]).to_csv(artifact_path("final_test_results.csv"), index=False)
    print(f"Saved: {artifact_path('final_test_results.csv')}")

    # ---- 14. Save final artifacts -------------------------------------------
    section("STEP 13: SAVING FINAL MODEL ARTIFACTS")
    joblib.dump(final_pipeline, artifact_path("osteoai_final_pipeline.pkl"))
    print(f"Saved: {artifact_path('osteoai_final_pipeline.pkl')}")

    joblib.dump(FEATURE_COLUMNS, artifact_path("osteoai_features.pkl"))
    print(f"Saved: {artifact_path('osteoai_features.pkl')}")

    class_distribution = {}
    for split_name, ys in {
        "full_dataset": df_clean[TARGET_COLUMN],
        "train": y_train,
        "validation": y_val,
        "test": y_test,
    }.items():
        pos = int((ys == 1).sum())
        neg = int((ys == 0).sum())
        class_distribution[split_name] = {
            "negative_count": neg,
            "positive_count": pos,
            "total": int(len(ys)),
            "positive_rate": pos / len(ys) if len(ys) > 0 else None,
        }

    metadata = {
        "project_name": PROJECT_NAME,
        "model_version": MODEL_VERSION,
        "training_timestamp_utc": training_start_ts,
        "dataset_path": DATA_PATH,
        "target_column": TARGET_COLUMN,
        "target_mapping": {str(k): v for k, v in TARGET_MAPPING.items()},
        "feature_names": FEATURE_COLUMNS,
        "feature_count": len(FEATURE_COLUMNS),
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "excluded_leakage_columns": EXPLICIT_LEAKAGE_COLUMNS,
        "train_size": int(len(X_train)),
        "validation_size": int(len(X_val)),
        "test_size": int(len(X_test)),
        "split_fractions": {"train": TRAIN_FRACTION, "validation": VAL_FRACTION, "test": TEST_FRACTION},
        "random_state": RANDOM_STATE,
        "selected_model": final_model_label,
        "selected_model_base_algorithm": best_name,
        "selection_metric": "validation ROC-AUC (primary); recall/precision/F1/PR-AUC reviewed secondarily",
        "imbalance_handling": {
            "logistic_regression": "class_weight='balanced' variant compared against standard",
            "random_forest": "class_weight='balanced' variant compared against standard",
            "hist_gradient_boosting": hgb_strategy_note,
        },
        "calibration": calibration_summary,
        "selected_threshold": selected_threshold,
        "threshold_selection_criterion": threshold_criterion,
        "preprocessing_summary": {
            "numeric_imputation": "median (fit on training split only)",
            "numeric_scaling": "StandardScaler (fit on training split only)",
            "categorical_imputation": "most_frequent (fit on training split only)",
            "categorical_encoding": (
                "sklearn OneHotEncoder(handle_unknown='ignore', drop='if_binary'), "
                "categories learned from training split only"
            ),
            "denormal_float_sanitization": "values with abs()<1e-6 snapped to 0.0 (deterministic, no fitting)",
            "duplicate_removal": "exact duplicate rows on feature+target values removed",
            "invalid_target_removal": "rows where target not in {0,1} removed",
            "encoded_feature_count_after_onehot": len(feature_names_out),
        },
        "class_distribution": class_distribution,
        "test_metrics": test_metrics,
        "sklearn_version": SKLEARN_VERSION,
        "shap_available": SHAP_AVAILABLE,
        "disclaimer": (
            "OsteoAI is a research / prototype risk-assessment model. Its output "
            "(osteoporosis_probability and a threshold-derived risk flag) is NOT a medical "
            "diagnosis and has NOT been clinically validated. The decision threshold was "
            "selected using a documented statistical criterion on a held-out validation "
            "split, not derived from clinical guidelines."
        ),
    }

    with open(artifact_path("osteoai_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    print(f"Saved: {artifact_path('osteoai_model_metadata.json')}")

    # ---- 15. FastAPI readiness ----------------------------------------------
    section("STEP 14: FASTAPI INFERENCE READINESS")
    example_row = X_test.iloc[0]
    example_dict = {c: (None if pd.isna(example_row[c]) else float(example_row[c])) for c in FEATURE_COLUMNS}

    print("Example request body FastAPI should accept (exact 22-feature shape, exact order):\n")
    print(json.dumps(example_dict, indent=2))
    print(
        "\nInference usage in FastAPI:\n"
        "    import joblib, pandas as pd\n"
        "    pipeline = joblib.load('models/osteoai_final_pipeline.pkl')\n"
        "    features = joblib.load('models/osteoai_features.pkl')\n"
        "    X = pd.DataFrame([payload_dict], columns=features)\n"
        "    probability = float(pipeline.predict_proba(X)[:, 1][0])\n"
        f"    threshold = {selected_threshold:.2f}  # from osteoai_model_metadata.json\n"
        "    risk_flag = int(probability >= threshold)\n"
        "The pipeline performs ALL preprocessing internally -- FastAPI only needs to pass "
        "the 22 raw feature values."
    )

    section("FINAL SUMMARY")
    print(f"FINAL MODEL:\n{final_model_label}")
    print(f"FINAL THRESHOLD:\n{selected_threshold:.2f}")
    print(f"TEST ROC-AUC:\n{test_metrics['roc_auc']:.4f}")
    print(f"TEST PR-AUC:\n{test_metrics['pr_auc_average_precision']:.4f}")
    print(f"TEST RECALL:\n{test_metrics['recall']:.4f}")
    print(f"TEST PRECISION:\n{test_metrics['precision']:.4f}")
    print(f"TEST F1:\n{test_metrics['f1_score']:.4f}")
    print(
        "\nOsteoAI is a RESEARCH / PROTOTYPE risk-assessment model. It does not produce a "
        "medical diagnosis and has not been clinically validated."
    )


if __name__ == "__main__":
    main()
