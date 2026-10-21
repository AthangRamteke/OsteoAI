import pandas as pd
from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
import time

# ============================================================
# OSTEOAI - OSTEOPOROSIS DATASET GENERATOR
# Official source: CDC / NHANES
# Cycle: 2017 - March 2020 Pre-Pandemic
# ============================================================

BASE_URL = "https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/"

OUTPUT_DIR = Path("osteoai_data")
OUTPUT_DIR.mkdir(exist_ok=True)

RAW_OUTPUT = OUTPUT_DIR / "osteoai_raw.csv"
CLEAN_OUTPUT = OUTPUT_DIR / "osteoai_osteoporosis_dataset.csv"


# ============================================================
# DATA FILES
# ============================================================

FILES = {
    # Demographics
    "demographics": "P_DEMO.XPT",

    # IMPORTANT: body measurements
    "body_measures": "P_BMX.XPT",

    # IMPORTANT: osteoporosis target and bone health information
    "osteoporosis": "P_OSQ.XPT",

    # Lifestyle data
    "smoking": "P_SMQ.XPT",
    "alcohol": "P_ALQ.XPT",
    "physical_activity": "P_PAQ.XPT",
}


# ============================================================
# DOWNLOAD FUNCTION
# ============================================================

def download_nhanes_xpt(file_name, dataset_name):
    """
    Downloads an official NHANES XPT file and converts it
    into a pandas DataFrame.
    """

    url = BASE_URL + file_name

    print(f"\nDownloading {dataset_name}...")
    print(f"URL: {url}")

    try:
        request = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        with urlopen(request, timeout=60) as response:
            data = response.read()

        df = pd.read_sas(
            BytesIO(data),
            format="xport"
        )

        # Convert byte-string column names / values if needed
        df.columns = [
            col.decode("utf-8") if isinstance(col, bytes) else col
            for col in df.columns
        ]

        print(
            f"SUCCESS: {dataset_name} -> "
            f"{len(df):,} rows, {len(df.columns)} columns"
        )

        return df

    except Exception as e:
        print(
            f"WARNING: Could not download "
            f"{dataset_name} ({file_name})"
        )
        print(f"Reason: {e}")

        return None


# ============================================================
# DOWNLOAD ALL DATASETS
# ============================================================

print("=" * 65)
print("OSTEOAI OSTEOPOROSIS DATASET GENERATOR")
print("=" * 65)

datasets = {}

for dataset_name, file_name in FILES.items():

    df = download_nhanes_xpt(
        file_name,
        dataset_name
    )

    if df is not None:

        if "SEQN" not in df.columns:
            print(
                f"WARNING: {dataset_name} does not contain SEQN."
            )
            continue

        datasets[dataset_name] = df

    time.sleep(0.5)


# ============================================================
# CHECK REQUIRED DATASETS
# ============================================================

required_datasets = [
    "demographics",
    "osteoporosis"
]

for name in required_datasets:

    if name not in datasets:
        raise RuntimeError(
            f"\nRequired dataset missing: {name}\n"
            f"Cannot create OsteoAI dataset."
        )


# ============================================================
# SHOW OSTEOPOROSIS COLUMNS
# ============================================================

print("\n" + "=" * 65)
print("OSTEOPOROSIS DATASET COLUMNS")
print("=" * 65)

print(
    datasets["osteoporosis"].columns.tolist()
)


# ============================================================
# START WITH OSTEOPOROSIS DATA
#
# IMPORTANT:
# Start with osteoporosis dataset because every person here
# belongs to the relevant osteoporosis questionnaire population.
#
# OSQ060:
# Has a doctor ever told you that you had osteoporosis?
# 1 = Yes
# 2 = No
# ============================================================

df = datasets["osteoporosis"].copy()


# ============================================================
# CHECK TARGET VARIABLE
# ============================================================

TARGET_COLUMN = "OSQ060"

if TARGET_COLUMN not in df.columns:

    available_columns = df.columns.tolist()

    raise ValueError(
        f"\n{TARGET_COLUMN} was not found.\n\n"
        f"Available osteoporosis columns:\n"
        f"{available_columns}"
    )


# ============================================================
# KEEP ONLY VALID OSTEOPOROSIS ANSWERS
#
# 1 = Yes
# 2 = No
#
# Other values such as:
# 7 = Refused
# 9 = Don't know
# are excluded.
# ============================================================

print("\nFiltering valid osteoporosis target values...")

df = df[
    df[TARGET_COLUMN].isin([1, 2])
].copy()


# ============================================================
# CREATE BINARY TARGET
#
# 1 = Osteoporosis
# 0 = No osteoporosis
# ============================================================

df["osteoporosis"] = df[TARGET_COLUMN].map({
    1: 1,
    2: 0
})

print(
    f"Valid osteoporosis records: {len(df):,}"
)


# ============================================================
# MERGE DEMOGRAPHICS
#
# LEFT JOIN is intentional.
#
# We do NOT want INNER JOIN because it can unnecessarily remove
# valid osteoporosis records when a lifestyle question is missing.
# ============================================================

print("\nMerging demographics...")

df = df.merge(
    datasets["demographics"],
    on="SEQN",
    how="left",
    suffixes=("", "_demo")
)


# ============================================================
# MERGE BODY MEASURES
# ============================================================

if "body_measures" in datasets:

    print("Merging body measurements...")

    df = df.merge(
        datasets["body_measures"],
        on="SEQN",
        how="left",
        suffixes=("", "_bmx")
    )


# ============================================================
# MERGE SMOKING
# ============================================================

if "smoking" in datasets:

    print("Merging smoking data...")

    df = df.merge(
        datasets["smoking"],
        on="SEQN",
        how="left",
        suffixes=("", "_smq")
    )


# ============================================================
# MERGE ALCOHOL
# ============================================================

if "alcohol" in datasets:

    print("Merging alcohol data...")

    df = df.merge(
        datasets["alcohol"],
        on="SEQN",
        how="left",
        suffixes=("", "_alq")
    )


# ============================================================
# MERGE PHYSICAL ACTIVITY
# ============================================================

if "physical_activity" in datasets:

    print("Merging physical activity data...")

    df = df.merge(
        datasets["physical_activity"],
        on="SEQN",
        how="left",
        suffixes=("", "_paq")
    )


# ============================================================
# CREATE FEATURE LIST
#
# Each tuple:
#
# (original NHANES column, OsteoAI column name)
# ============================================================

FEATURES = {

    # --------------------------------------------------------
    # IDENTIFICATION
    # --------------------------------------------------------

    "SEQN": "patient_id",


    # --------------------------------------------------------
    # DEMOGRAPHICS
    # --------------------------------------------------------

    "RIDAGEYR": "age",
    "RIAGENDR": "gender",
    "RIDRETH3": "race_ethnicity",


    # --------------------------------------------------------
    # BODY MEASUREMENTS
    # --------------------------------------------------------

    "BMXBMI": "bmi",
    "BMXWT": "weight_kg",
    "BMXHT": "height_cm",
    "BMXWAIST": "waist_cm",
    "BMXHIP": "hip_cm",


    # --------------------------------------------------------
    # FRACTURE HISTORY
    # --------------------------------------------------------

    "OSQ010a": "hip_fracture_history",
    "OSQ010b": "wrist_fracture_history",
    "OSQ010c": "spine_fracture_history",

    "OSQ020a": "number_of_hip_fractures",
    "OSQ020b": "number_of_wrist_fractures",
    "OSQ020c": "number_of_spine_fractures",

    "OSQ080": "other_bone_fracture_after_20",


    # --------------------------------------------------------
    # STEROID USE
    # --------------------------------------------------------

    "OSQ130": "long_term_steroid_use",

    "OSQ140q": "steroid_use_duration",
    "OSQ140u": "steroid_duration_unit",


    # --------------------------------------------------------
    # FAMILY HISTORY
    # --------------------------------------------------------

    "OSQ150": "parent_osteoporosis_history",

    "OSQ160a": "mother_osteoporosis",

    "OSQ160b": "father_osteoporosis",

    "OSQ170": "mother_hip_fracture",

    "OSQ180": "mother_hip_fracture_age",

    "OSQ200": "father_hip_fracture",

    "OSQ210": "father_hip_fracture_age",


    # --------------------------------------------------------
    # SMOKING
    # --------------------------------------------------------

    "SMQ020": "smoked_100_cigarettes",

    "SMD641": "smokes_now",


    # --------------------------------------------------------
    # ALCOHOL
    # --------------------------------------------------------

    "ALQ111": "alcohol_frequency",

    "ALQ121": "alcohol_drinks_per_day",


    # --------------------------------------------------------
    # PHYSICAL ACTIVITY
    # --------------------------------------------------------

    "PAQ605": "vigorous_work_activity",

    "PAQ620": "moderate_work_activity",

    "PAQ635": "walk_or_bicycle",

    "PAQ650": "vigorous_recreation",

    "PAQ665": "moderate_recreation",

    "PAD680": "sedentary_minutes",
}


# ============================================================
# KEEP ONLY COLUMNS THAT ACTUALLY EXIST
#
# This makes the script more robust if a NHANES variable
# is unavailable.
# ============================================================

available_features = {}

missing_features = []

for original_column, new_column in FEATURES.items():

    if original_column in df.columns:

        available_features[
            original_column
        ] = new_column

    else:

        missing_features.append(
            original_column
        )


# ============================================================
# CREATE FINAL DATASET
# ============================================================

selected_columns = list(
    available_features.keys()
)

final_df = df[
    selected_columns
].copy()


# ============================================================
# RENAME COLUMNS
# ============================================================

final_df.rename(
    columns=available_features,
    inplace=True
)


# ============================================================
# ADD TARGET COLUMN
# ============================================================

final_df["osteoporosis"] = df[
    "osteoporosis"
]


# ============================================================
# REMOVE DUPLICATE PATIENTS
# ============================================================

before_duplicates = len(final_df)

final_df = final_df.drop_duplicates(
    subset=["patient_id"]
)

after_duplicates = len(final_df)

print(
    f"\nDuplicates removed: "
    f"{before_duplicates - after_duplicates}"
)


# ============================================================
# CLEAN SPECIAL MISSING VALUES
#
# NHANES commonly uses values such as:
# 7 / 77 / 777 = Refused
# 9 / 99 / 999 = Don't know
# ============================================================

MISSING_CODES = [

    7, 9,

    77, 99,

    777, 999,

    7777, 9999,

    77777, 99999,

    777777, 999999
]

final_df = final_df.replace(
    MISSING_CODES,
    pd.NA
)


# ============================================================
# CONVERT YES / NO VARIABLES
#
# NHANES:
# 1 = Yes
# 2 = No
#
# Converted to:
# 1 = Yes
# 0 = No
# ============================================================

BINARY_COLUMNS = [

    "hip_fracture_history",
    "wrist_fracture_history",
    "spine_fracture_history",

    "other_bone_fracture_after_20",

    "long_term_steroid_use",

    "parent_osteoporosis_history",

    "mother_osteoporosis",
    "father_osteoporosis",

    "mother_hip_fracture",
    "father_hip_fracture",

    "smoked_100_cigarettes",
    "smokes_now",

    "vigorous_work_activity",
    "moderate_work_activity",

    "walk_or_bicycle",

    "vigorous_recreation",
    "moderate_recreation",
]


for column in BINARY_COLUMNS:

    if column in final_df.columns:

        final_df[column] = final_df[
            column
        ].map({
            1: 1,
            2: 0
        })


# ============================================================
# CONVERT DATA TYPES
# ============================================================

for column in final_df.columns:

    if column == "patient_id":
        continue

    if column == "osteoporosis":
        continue

    final_df[column] = pd.to_numeric(
        final_df[column],
        errors="ignore"
    )


# ============================================================
# REMOVE COMPLETELY EMPTY COLUMNS
# ============================================================

empty_columns = [
    column
    for column in final_df.columns
    if final_df[column].isna().all()
]

if empty_columns:

    print(
        "\nRemoving completely empty columns:"
    )

    print(empty_columns)

    final_df = final_df.drop(
        columns=empty_columns
    )


# ============================================================
# SAVE RAW DATASET
# ============================================================

df.to_csv(
    RAW_OUTPUT,
    index=False
)

print(
    f"\nRaw merged data saved to:\n"
    f"{RAW_OUTPUT}"
)


# ============================================================
# SAVE FINAL OSTEOPOROSIS DATASET
# ============================================================

final_df.to_csv(
    CLEAN_OUTPUT,
    index=False
)


# ============================================================
# FINAL REPORT
# ============================================================

print("\n" + "=" * 65)

print(
    "OSTEOAI DATASET GENERATED SUCCESSFULLY"
)

print("=" * 65)

print(
    f"\nTotal patients: "
    f"{len(final_df):,}"
)

print(
    f"Total columns: "
    f"{len(final_df.columns)}"
)


# ============================================================
# TARGET DISTRIBUTION
# ============================================================

print("\n" + "-" * 65)
print("TARGET DISTRIBUTION")
print("-" * 65)

target_counts = final_df[
    "osteoporosis"
].value_counts()

print(target_counts)

osteoporosis_count = (
    final_df["osteoporosis"] == 1
).sum()

non_osteoporosis_count = (
    final_df["osteoporosis"] == 0
).sum()

print(
    f"\nOsteoporosis patients: "
    f"{osteoporosis_count:,}"
)

print(
    f"No osteoporosis: "
    f"{non_osteoporosis_count:,}"
)


# ============================================================
# MISSING VALUES
# ============================================================

print("\n" + "-" * 65)
print("MISSING VALUES")
print("-" * 65)

missing_report = final_df.isna().sum()

missing_report = missing_report[
    missing_report > 0
].sort_values(
    ascending=False
)

if len(missing_report) > 0:

    print(missing_report)

else:

    print("No missing values.")


# ============================================================
# DATASET PREVIEW
# ============================================================

print("\n" + "-" * 65)
print("DATASET PREVIEW")
print("-" * 65)

print(
    final_df.head(10).to_string()
)


# ============================================================
# COLUMN LIST
# ============================================================

print("\n" + "-" * 65)
print("FINAL COLUMNS")
print("-" * 65)

for i, column in enumerate(
    final_df.columns,
    start=1
):

    print(
        f"{i}. {column}"
    )


# ============================================================
# MISSING ORIGINAL FEATURES
# ============================================================

if missing_features:

    print("\n" + "-" * 65)

    print(
        "NHANES COLUMNS NOT FOUND "
        "(SKIPPED SAFELY)"
    )

    print("-" * 65)

    for column in missing_features:

        print(f"- {column}")


print("\n" + "=" * 65)

print("FILES CREATED")

print("=" * 65)

print(
    f"\nFinal ML dataset:\n"
    f"{CLEAN_OUTPUT}"
)

print(
    f"\nRaw merged dataset:\n"
    f"{RAW_OUTPUT}"
)

print("\nYou can now use the final CSV for ML preprocessing.")

print("=" * 65)