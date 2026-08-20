import Assessment from "../pages/assessment/assessment";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../features/landing/LandingPage";
import LoginPage from "../features/authentication/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment" element={<Assessment />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;