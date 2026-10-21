from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT / "backend" / "models" / "osteoai_final_pipeline.pkl"
FEATURES_PATH = ROOT / "backend" / "models" / "osteoai_features.pkl"
TEST_PATH = ROOT / "ml" / "models" / "test_predictions.csv"
OUTPUT_DIR = ROOT / "ml" / "models"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


print("Loading frozen OsteoAI model...")
pipeline = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)
test_df = pd.read_csv(TEST_PATH)

print("Model loaded.")
print("Feature count:", len(feature_names))

X_test = test_df[feature_names].copy()

preprocessor = pipeline.named_steps["preprocessor"]
model = pipeline.named_steps["model"]

print("Transforming test data with the frozen preprocessor...")
X_test_transformed = preprocessor.transform(X_test)

feature_names_out = preprocessor.get_feature_names_out()

feature_names_out = [
    name.split("__", 1)[1] if "__" in name else name
    for name in feature_names_out
]

print("Transformed shape:", X_test_transformed.shape)
print("Creating SHAP LinearExplainer...")

explainer = shap.LinearExplainer(
    model,
    X_test_transformed,
)

sample_size = min(300, X_test_transformed.shape[0])

rng = np.random.RandomState(42)

sample_indices = rng.choice(
    X_test_transformed.shape[0],
    size=sample_size,
    replace=False,
)

X_sample = X_test_transformed[sample_indices]

shap_values = explainer.shap_values(X_sample)

shap_values = np.asarray(shap_values)

if shap_values.ndim == 3:
    shap_values = shap_values[:, :, -1]

if isinstance(shap_values, list):
    shap_values = np.asarray(shap_values[1])

mean_abs_shap = np.abs(shap_values).mean(axis=0)

shap_df = pd.DataFrame(
    {
        "feature": feature_names_out,
        "mean_abs_shap_value": mean_abs_shap,
    }
).sort_values(
    "mean_abs_shap_value",
    ascending=False,
).reset_index(drop=True)

shap_df.insert(
    0,
    "rank",
    np.arange(1, len(shap_df) + 1),
)

csv_path = OUTPUT_DIR / "shap_feature_importance.csv"

shap_df.to_csv(
    csv_path,
    index=False,
)

print(f"Saved: {csv_path}")

print("\nTop 10 SHAP features:")
print(shap_df.head(10).to_string(index=False))

png_path = OUTPUT_DIR / "shap_summary.png"

plt.figure(figsize=(9, 8))

shap.summary_plot(
    shap_values,
    X_sample,
    feature_names=feature_names_out,
    show=False,
)

plt.tight_layout()

plt.savefig(
    png_path,
    dpi=150,
    bbox_inches="tight",
)

plt.close()

print(f"Saved: {png_path}")
print("\nFresh SHAP generation complete.")