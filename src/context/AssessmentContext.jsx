import { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [assessmentData, setAssessmentData] = useState({
    personal: {
      name: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
    },

    lifestyle: {
      physicalActivity: "",
      smoking: "",
      alcohol: "",
    },

    medicalHistory: {
      familyHistory: "",
      previousFracture: "",
      medications: "",
    },
  });

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
    setAssessmentData({
      personal: {
        name: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
      },

      lifestyle: {
        physicalActivity: "",
        smoking: "",
        alcohol: "",
      },

      medicalHistory: {
        familyHistory: "",
        previousFracture: "",
        medications: "",
      },
    });
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