import Assessment from "../pages/assessment/assessment";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../features/landing/LandingPage";
import LoginPage from "../features/authentication/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import HistoryPage from "../features/history/HistoryPage";
import HistoryResultPage from "../features/history/HistoryResultPage";
import AssistantPage from "../features/assistant/AssistantPage";
import KnowledgePage from "../features/knowledge/KnowledgePage";
import SimulatorPage from "../features/simulator/SimulatorPage";
import FindDoctorPage from "../features/doctors/FindDoctorPage";
import ReminderWatcher from "../features/assistant/ReminderWatcher";
import ForecastPage from "../pages/Forecast/ForecastPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      {/* Announces reminders on whichever page the user is on. */}
      <ReminderWatcher />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment" element={<Assessment />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<HistoryResultPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/find-doctor" element={<FindDoctorPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;