import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HelpIcon from "@mui/icons-material/Help";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

function DashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      label: "New Assessment",
      icon: <AssignmentIcon />,
      path: "/assessment",
    },
    {
      label: "Assessment History",
      icon: <HistoryIcon />,
      path: "#",
    },
    {
      label: "AI Assistant",
      icon: <PsychologyIcon />,
      path: "#",
    },
    {
      label: "FAQ & Support",
      icon: <HelpIcon />,
      path: "#",
    },
  ];

  const handleNavigation = (path) => {
    if (path !== "#") {
      navigate(path);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#F8FAFC",
      }}
    >
      {/* SIDEBAR */}
      <Box
        sx={{
          width: sidebarOpen ? 260 : 78,
          minHeight: "100vh",
          bgcolor: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "sticky",
          top: 0,
        }}
      >
        {/* TOP SECTION */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen
              ? "space-between"
              : "center",
            px: sidebarOpen ? 2 : 1,
            py: 2,
            minHeight: 76,
          }}
        >
          {sidebarOpen && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <HealthAndSafetyIcon />
              </Box>

              <Box>
                <Typography
                  fontWeight={800}
                  sx={{
                    color: "#0F172A",
                    lineHeight: 1.1,
                  }}
                >
                  OsteoAI
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                  }}
                >
                  Bone Health
                </Typography>
              </Box>
            </Box>
          )}

          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            color="primary"
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* USER PROFILE */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: sidebarOpen ? 2 : 1,
            py: 2,
            justifyContent: sidebarOpen
              ? "flex-start"
              : "center",
          }}
        >
          <Tooltip
            title={!sidebarOpen ? "User Profile" : ""}
            placement="right"
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                cursor: "pointer",
              }}
            >
              U
            </Avatar>
          </Tooltip>

          {sidebarOpen && (
            <Box>
              <Typography
                fontWeight={700}
                variant="body2"
              >
                User Account
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                View your profile
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* MAIN MENU */}
        <List
          sx={{
            px: 1,
            py: 2,
          }}
        >
          {menuItems.map((item) => (
            <Tooltip
              key={item.label}
              title={!sidebarOpen ? item.label : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() =>
                  handleNavigation(item.path)
                }
                selected={
                  item.label === "Dashboard"
                }
                sx={{
                  minHeight: 50,
                  borderRadius: 2,
                  mb: 0.75,
                  justifyContent: sidebarOpen
                    ? "initial"
                    : "center",

                  "&.Mui-selected": {
                    bgcolor:
                      "rgba(37, 99, 235, 0.10)",
                    color: "primary.main",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor:
                      "rgba(37, 99, 235, 0.14)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: sidebarOpen ? 42 : 0,
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {sidebarOpen && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "0.92rem",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* BOTTOM MENU */}
        <Box
          sx={{
            mt: "auto",
            px: 1,
            pb: 2,
          }}
        >
          <Tooltip
            title={!sidebarOpen ? "Settings" : ""}
            placement="right"
          >
            <ListItemButton
              sx={{
                minHeight: 50,
                borderRadius: 2,
                mb: 0.75,
                justifyContent: sidebarOpen
                  ? "initial"
                  : "center",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: sidebarOpen ? 42 : 0,
                  justifyContent: "center",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>

              {sidebarOpen && (
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          <Tooltip
            title={!sidebarOpen ? "Logout" : ""}
            placement="right"
          >
            <ListItemButton
              sx={{
                minHeight: 50,
                borderRadius: 2,
                color: "#DC2626",
                justifyContent: sidebarOpen
                  ? "initial"
                  : "center",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: sidebarOpen ? 42 : 0,
                  justifyContent: "center",
                  color: "#DC2626",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>

              {sidebarOpen && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flexGrow: 1,
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* WELCOME SECTION */}
        <Box
          sx={{
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color: "#0F172A",
            }}
          >
            Welcome to OsteoAI 👋
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Monitor your bone health and manage your
            osteoporosis risk assessments.
          </Typography>
        </Box>

        {/* MAIN CARD */}
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 4,
            p: 4,
            maxWidth: 900,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Ready for a new assessment?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            Complete a short assessment to receive an
            AI-powered osteoporosis risk prediction and
            understand the factors influencing the result.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/assessment")}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.25,
            }}
          >
            Start Assessment
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
