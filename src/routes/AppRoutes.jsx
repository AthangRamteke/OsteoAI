import Assessment from "../pages/assessment/assessment";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

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
import { GuestRoute, ProtectedRoute } from "./RouteGuards";

/*
 * Every page opens at its top. The router keeps the previous page's
 * scroll position by default, which is why pages used to open halfway
 * down. In-page anchors (#features, ...) are left to their own handlers.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      {/* Announces reminders on whichever page the user is on. */}
      <ReminderWatcher />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<HistoryResultPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/find-doctor" element={<FindDoctorPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;