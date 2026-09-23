import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Container, Stack, Typography } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import Navbar from "./Navbar";
import { useLanguage } from "../../context/LanguageContext";

const getSections = (t) => [
  {
    label: t("assistant.shortHistory"),
    path: "/history",
    icon: <HistoryIcon fontSize="small" />,
  },
  {
    label: t("assistant.shortAssistant"),
    path: "/assistant",
    icon: <AutoAwesomeIcon fontSize="small" />,
  },
  {
    label: t("assistant.shortKnowledge"),
    path: "/knowledge",
    icon: <MenuBookIcon fontSize="small" />,
  },
];

/*
 * Shared layout for the sidebar sections (History, AI Assistant,
 * Knowledge & Support): navbar, a gradient page header with a
 * back-to-dashboard link, and quick switching between sections.
 */
function PageShell({ icon, title, subtitle, actions, children, maxWidth = "lg" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const sections = getSections(t);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <Navbar />

      <Box
        sx={{
          background:
            "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 55%, #F8FAFC 100%)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 4 } }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 2.5,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{ textTransform: "none", fontWeight: 700, color: "#475569" }}
            >
              {t("sidebar.dashboard")}
            </Button>

            <Stack direction="row" spacing={1}>
              {sections.map((section) => {
                const active = pathname.startsWith(section.path);

                return (
                  <Button
                    key={section.path}
                    size="small"
                    startIcon={section.icon}
                    onClick={() => navigate(section.path)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 99,
                      px: 1.75,
                      color: active ? "#FFFFFF" : "#2563EB",
                      bgcolor: active ? "#2563EB" : "rgba(37,99,235,0.08)",
                      "&:hover": {
                        bgcolor: active ? "#1D4ED8" : "rgba(37,99,235,0.14)",
                      },
                      display: { xs: active ? "inline-flex" : "none", sm: "inline-flex" },
                    }}
                  >
                    {section.label}
                  </Button>
                );
              })}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0F172A", fontSize: { xs: 26, md: 32 } }}
                >
                  {title}
                </Typography>
                <Typography sx={{ color: "#475569", mt: 0.5 }}>{subtitle}</Typography>
              </Box>
            </Stack>

            {actions}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}

export default PageShell;
