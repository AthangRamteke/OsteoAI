import { postPrediction } from "./api";

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const yesNoToBinary = (value) => {
  if (value === "Yes") return 1;
  if (value === "No") return 0;

  return null;
};

const genderToModelCode = (value) => {
  if (value === "Male") return 1;
  if (value === "Female") return 2;

  // "Other" is not one of the trained gender categories.
  // Leave it missing rather than forcing an incorrect category.
  return null;
};

const buildPredictionPayload = (assessmentData) => {
  const { personal, lifestyle, medicalHistory } =
    assessmentData;

  const height = toNumberOrNull(personal.height);
  const weight = toNumberOrNull(personal.weight);

  const bmi =
    height !== null &&
    weight !== null &&
    height > 0
      ? weight / Math.pow(height / 100, 2)
      : null;

  return {
    age: toNumberOrNull(personal.age),

    gender: genderToModelCode(personal.gender),

    race_ethnicity: toNumberOrNull(
      personal.raceEthnicity
    ),

    bmi,

    weight_kg: weight,

    height_cm: height,

    waist_cm: toNumberOrNull(personal.waist),

    hip_cm: toNumberOrNull(personal.hip),

    other_bone_fracture_after_20:
      yesNoToBinary(
        medicalHistory.otherBoneFractureAfter20
      ),

    long_term_steroid_use:
      yesNoToBinary(
        medicalHistory.longTermSteroidUse
      ),

    parent_osteoporosis_history:
      yesNoToBinary(
        medicalHistory.parentOsteoporosisHistory
      ),

    mother_hip_fracture:
      yesNoToBinary(
        medicalHistory.motherHipFracture
      ),

    father_hip_fracture:
      yesNoToBinary(
        medicalHistory.fatherHipFracture
      ),

    smoked_100_cigarettes:
      yesNoToBinary(
        lifestyle.smoked100Cigarettes
      ),

    /*
     * IMPORTANT:
     * The trained model uses the original NHANES field
     * ALQ111 under the misleading name
     * `alcohol_frequency`.
     *
     * ALQ111:
     * 1 = Yes, ever had an alcoholic drink
     * 2 = No
     */
    alcohol_frequency:
      lifestyle.alcoholEver === "Yes"
        ? 1
        : lifestyle.alcoholEver === "No"
          ? 2
          : null,

    /*
     * The trained model uses ALQ121 under the field
     * name `alcohol_drinks_per_day`.
     *
     * This is actually the coded drinking frequency
     * from the past 12 months.
     */
    alcohol_drinks_per_day:
      toNumberOrNull(
        lifestyle.alcoholFrequency
      ),

    vigorous_work_activity:
      yesNoToBinary(
        lifestyle.vigorousWorkActivity
      ),

    moderate_work_activity:
      yesNoToBinary(
        lifestyle.moderateWorkActivity
      ),

    walk_or_bicycle:
      yesNoToBinary(
        lifestyle.walkOrBicycle
      ),

    vigorous_recreation:
      yesNoToBinary(
        lifestyle.vigorousRecreation
      ),

    moderate_recreation:
      yesNoToBinary(
        lifestyle.moderateRecreation
      ),

    sedentary_minutes:
      toNumberOrNull(
        lifestyle.sedentaryMinutes
      ),
  };
};

export async function predictAssessment(
  assessmentData
) {
  const payload =
    buildPredictionPayload(assessmentData);

  const result = await postPrediction(payload);

  return {
    ...result,
    requestPayload: payload,
  };
}

export { buildPredictionPayload };