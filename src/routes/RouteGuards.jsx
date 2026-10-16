import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/LanguageContext";

const DEFAULT_AFTER_LOGIN = "/dashboard";

function SessionCheck() {
  const { t } = useLanguage();

  return (
    <Box
      role="status"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        color: "var(--oa-text-500)",
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2">{t("auth.checkingSession")}</Typography>
    </Box>
  );
}

/** Signed-out visitors are sent to /login, remembering where they were going. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionCheck />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Login/sign-up pages. Signed-in users are sent on to the page they
 * originally asked for, or the dashboard. This is also what redirects
 * right after a successful sign in or sign up.
 */
export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionCheck />;
  }

  if (user) {
    const from = location.state?.from;
    const target = from
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : DEFAULT_AFTER_LOGIN;

    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
