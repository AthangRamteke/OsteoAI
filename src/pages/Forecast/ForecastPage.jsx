import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Container } from "@mui/material";

import Navbar from "../../components/common/Navbar";
import RiskForecastRecommendations from "../../components/forecast/RiskForecastRecommendations";

/*
|--------------------------------------------------------------------------
| ForecastPage
|--------------------------------------------------------------------------
| Thin wrapper around RiskForecastRecommendations. It reads the same
| "osteoai_latest_assessment" record from localStorage that
| DashboardPage.jsx already reads (written by pages/Assessment/Assessment.jsx
| right after a prediction succeeds) so this screen always reflects the
| existing ML model's most recent actual output — never a value computed
| here.
*/

function ForecastPage() {
  const navigate = useNavigate();

  const [latestAssessment, setLatestAssessment] =
    useState(null);

  useEffect(() => {
    const readLatestAssessment = () => {
      try {
        const stored = localStorage.getItem(
          "osteoai_latest_assessment"
        );

        if (!stored) {
          setLatestAssessment(null);
          return;
        }

        const parsed = JSON.parse(stored);

        setLatestAssessment(
          parsed?.assessmentData && parsed?.predictionResult
            ? parsed
            : null
        );
      } catch (error) {
        console.warn(
          "OsteoAI forecast data could not be read:",
          error
        );
        setLatestAssessment(null);
      }
    };

    readLatestAssessment();

    window.addEventListener(
      "osteoai:assessment-updated",
      readLatestAssessment
    );
    window.addEventListener("storage", readLatestAssessment);

    return () => {
      window.removeEventListener(
        "osteoai:assessment-updated",
        readLatestAssessment
      );
      window.removeEventListener(
        "storage",
        readLatestAssessment
      );
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 3, md: 5 },
          background:
            "radial-gradient(1200px circle at 50% 0%, rgba(37, 99, 235, 0.06) 0%, #F8FAFC 100%)",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              borderRadius: { xs: 3, md: 5 },
              border: "1px solid #E2E8F0",
              bgcolor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
              p: { xs: 2.5, sm: 4, md: 5 },
            }}
          >
            <RiskForecastRecommendations
              assessmentData={
                latestAssessment?.assessmentData
              }
              predictionResult={
                latestAssessment?.predictionResult
              }
              onBack={() => navigate(-1)}
              onRetake={() => navigate("/assessment")}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default ForecastPage;
