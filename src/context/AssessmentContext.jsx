import { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

const initialAssessmentData = {
  personal: {
    name: "",
    age: "",
    gender: "",
    raceEthnicity: "",
    height: "",
    weight: "",
    waist: "",
    hip: "",
  },

  lifestyle: {
    smoked100Cigarettes: "",
    alcoholEver: "",
    alcoholFrequency: "",

    vigorousWorkActivity: "",
    moderateWorkActivity: "",
    walkOrBicycle: "",
    vigorousRecreation: "",
    moderateRecreation: "",
    sedentaryMinutes: "",
  },

  medicalHistory: {
    otherBoneFractureAfter20: "",
    longTermSteroidUse: "",
    parentOsteoporosisHistory: "",
    motherHipFracture: "",
    fatherHipFracture: "",
  },
};

export function AssessmentProvider({ children }) {
  const [assessmentData, setAssessmentData] = useState(
    initialAssessmentData
  );

  const updatePersonal = (data) => {
    setAssessmentData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        ...data,
      },
    }));
  };

  const updateLifestyle = (data) => {
    setAssessmentData((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        ...data,
      },
    }));
  };

  const updateMedicalHistory = (data) => {
    setAssessmentData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        ...data,
      },
    }));
  };

  const resetAssessment = () => {
    setAssessmentData(initialAssessmentData);
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessmentData,
        updatePersonal,
        updateLifestyle,
        updateMedicalHistory,
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);

  if (!context) {
    throw new Error(
      "useAssessment must be used inside an AssessmentProvider"
    );
  }

  return context;
}