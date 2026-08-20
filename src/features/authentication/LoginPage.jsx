import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from "@mui/material";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import InsightsIcon from "@mui/icons-material/Insights";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupPath =
    location.pathname === "/signup" ||
    location.pathname === "/register";

  const [mode, setMode] = useState(
    isSignupPath ? "register" : "login"
  );

  useEffect(() => {
    setMode(
      location.pathname === "/signup" ||
      location.pathname === "/register"
        ? "register"
        : "login"
    );
  }, [location.pathname]);

  const handleModeChange = (newMode) => {
    setMode(newMode);

    navigate(
      newMode === "login"
        ? "/login"
        : "/signup",
      {
        replace: true,
      }
    );
  };

  const isLogin = mode === "login";

  const loginBenefits = [
    {
      icon: <HistoryIcon />,
      text: "Access your saved assessments",
    },
    {
      icon: <InsightsIcon />,
      text: "Continue your personalized journey",
    },
    {
      icon: <SmartToyIcon />,
      text: "Explore personalized AI guidance",
    },
  ];

  const registerBenefits = [
    {
      icon: <PersonAddAltIcon />,
      text: "Build your personal health profile",
    },
    {
      icon: <HistoryIcon />,
      text: "Save your assessment history",
    },
    {
      icon: <DescriptionIcon />,
      text: "Access future reports and insights",
    },
  ];

  const benefits = isLogin
    ? loginBenefits
    : registerBenefits;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 3, md: 6 },
        background:
          "radial-gradient(1000px circle at 20% 20%, rgba(37,99,235,0.10) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: { xs: 4, md: 6 },
            border: "1px solid #DCE6F4",
            bgcolor: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 24px 70px rgba(15,23,42,0.08)",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "0.9fr 1.1fr",
            },
          }}
        >
          {/* LEFT PANEL */}
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "#F8FAFC",
              background:
                "radial-gradient(600px circle at 40% 30%, rgba(37,99,235,0.13) 0%, rgba(255,255,255,0) 68%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow:
                    "0 8px 22px rgba(37,99,235,0.18)",
                }}
              >
                <HealthAndSafetyIcon />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    color: "#0F172A",
                    lineHeight: 1,
                  }}
                >
                  OsteoAI
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "#64748B",
                  }}
                >
                  Bone Health Intelligence
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mt: 6,
                maxWidth: 520,
                fontSize: {
                  xs: "2rem",
                  md: "3rem",
                },
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#0F172A",
              }}
            >
              {isLogin ? (
                <>
                  Welcome back to
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: "primary.main",
                    }}
                  >
                    OsteoAI.
                  </Box>
                </>
              ) : (
                <>
                  Start your
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: "primary.main",
                    }}
                  >
                    OsteoAI journey.
                  </Box>
                </>
              )}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                maxWidth: 500,
                lineHeight: 1.8,
                color: "#64748B",
              }}
            >
              {isLogin
                ? "Continue your bone-health journey and access your saved assessment experience."
                : "Create your account to save your assessment history and build your personalized bone-health profile."}
            </Typography>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {benefits.map((item) => (
                <Box
                  key={item.text}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#EEF4FF",
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      color: "#334155",
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* RIGHT PANEL */}
          <Box
            sx={{
              p: { xs: 3, sm: 5, md: 6 },
              bgcolor:
                "rgba(255,255,255,0.94)",
            }}
          >
            {/* Mode selector */}
            <Box
              sx={{
                display: "inline-flex",
                p: 0.5,
                borderRadius: 3,
                bgcolor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                mb: 4,
              }}
            >
              <Button
                onClick={() =>
                  handleModeChange("login")
                }
                sx={{
                  minWidth: 105,
                  px: 2,
                  py: 1,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  color: isLogin
                    ? "white"
                    : "#64748B",
                  bgcolor: isLogin
                    ? "primary.main"
                    : "transparent",
                  boxShadow: isLogin
                    ? "0 5px 14px rgba(37,99,235,0.18)"
                    : "none",
                  "&:hover": {
                    bgcolor: isLogin
                      ? "primary.dark"
                      : "rgba(37,99,235,0.05)",
                  },
                }}
              >
                Sign In
              </Button>

              <Button
                onClick={() =>
                  handleModeChange("register")
                }
                sx={{
                  minWidth: 105,
                  px: 2,
                  py: 1,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  color: !isLogin
                    ? "white"
                    : "#64748B",
                  bgcolor: !isLogin
                    ? "primary.main"
                    : "transparent",
                  boxShadow: !isLogin
                    ? "0 5px 14px rgba(37,99,235,0.18)"
                    : "none",
                  "&:hover": {
                    bgcolor: !isLogin
                      ? "primary.dark"
                      : "rgba(37,99,235,0.05)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>

            {isLogin ? (
              <LoginForm
                onSwitch={() =>
                  handleModeChange("register")
                }
              />
            ) : (
              <RegisterForm
                onSwitch={() =>
                  handleModeChange("login")
                }
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;