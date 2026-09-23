import { useRef, useState } from "react";
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
  Menu,
} from "@mui/material";

import ScrollProgressBar from "../../components/common/ScrollProgressBar";
import Navbar from "../../components/common/Navbar";

import Hero from "../../components/landing/Hero";
import FeaturesSection from "../../components/landing/FeaturesSection";
import HowItWorks from "../../components/landing/HowItWorks";
import AboutSection from "../../components/landing/AboutSection";
import Footer from "../../components/common/Footer";
import LanguageMenuItems from "../../components/common/LanguageMenuItems";

import { useLanguage } from "../../context/LanguageContext";

/*
|--------------------------------------------------------------------------
| Custom SVG Icon System
|--------------------------------------------------------------------------
*/

const IconBase = ({
  children,
  size = 22,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const MenuSvg = ({ open = false }) => (
  <IconBase size={22}>
    {open ? (
      <>
        <path
          d="M6 6L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <path
          d="M4 7H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 12H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 17H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    )}
  </IconBase>
);

const HomeSvg = () => (
  <IconBase>
    <rect
      x="4"
      y="4"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="14"
      y="4"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="4"
      y="14"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="14"
      y="14"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
  </IconBase>
);

const AssessmentSvg = () => (
  <IconBase>
    <rect
      x="5"
      y="4"
      width="14"
      height="17"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M9 4.5V3.5C9 2.67 9.67 2 10.5 2H13.5C14.33 2 15 2.67 15 3.5V4.5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 10H15"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 14H15"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 18H12"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const HistorySvg = () => (
  <IconBase>
    <path
      d="M4 12A8 8 0 1 0 7 6.35"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M4 5V10H9"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V12L15 14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

const AIIcon = () => (
  <IconBase>
    <path
      d="M8 9.5C8 7.57 9.57 6 11.5 6H12.5C14.43 6 16 7.57 16 9.5V14.5C16 16.43 14.43 18 12.5 18H11.5C9.57 18 8 16.43 8 14.5V9.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M6 11V14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M18 11V14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M10 22V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 22V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M10 2V6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 2V6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle
      cx="10.5"
      cy="12"
      r="0.8"
      fill="currentColor"
    />
    <circle
      cx="13.5"
      cy="12"
      r="0.8"
      fill="currentColor"
    />
  </IconBase>
);

const KnowledgeSvg = () => (
  <IconBase>
    <path
      d="M5 5.5C5 4.67 5.67 4 6.5 4H11V19H6.5C5.67 19 5 19.67 5 20.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M19 5.5C19 4.67 18.33 4 17.5 4H13V19H17.5C18.33 19 19 19.67 19 20.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M8 8H10"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 8H16"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

// Globe/language icon — the sidebar's popover only ever offered the
// language switcher, so the gear ("Settings") icon and label were
// misleading; this is a plain globe to signal "change language" instead.
const LanguageSvg = () => (
  <IconBase>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M3 12H21"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M12 3C14.5 5.5 15.8 8.6 15.8 12C15.8 15.4 14.5 18.5 12 21C9.5 18.5 8.2 15.4 8.2 12C8.2 8.6 9.5 5.5 12 3Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
  </IconBase>
);

const LogoutSvg = () => (
  <IconBase>
    <path
      d="M10 5H6.5C5.67 5 5 5.67 5 6.5V17.5C5 18.33 5.67 19 6.5 19H10"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8L18 12L14 16"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12H18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const ChevronSvg = () => (
  <IconBase size={18}>
    <path
      d="M9 6L15 12L9 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [settingsAnchorEl, setSettingsAnchorEl] =
    useState(null);

  const sidebarRef = useRef(null);

  const openSettingsMenu = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const closeSettingsMenu = () => {
    setSettingsAnchorEl(null);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleHome = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    closeSidebar();
  };

  const handleAssessment = () => {
    navigate("/assessment");
    closeSidebar();
  };

  const goTo = (path) => () => {
    navigate(path);
    closeSidebar();
  };

  /*
  |--------------------------------------------------------------------------
  | NAVBAR ↔ SIDEBAR LAYOUT
  |--------------------------------------------------------------------------
  | The sidebar always sits flush with the very top of the viewport (see
  | its `top: 0` below, at rest and while expanded) and the navbar shrinks
  | and shifts to match whichever width the sidebar currently is — see the
  | `sidebarOpen` prop passed to <Navbar /> below. That keeps the two from
  | ever overlapping or leaving a gap, without needing to measure either
  | element's position on every frame.
  */

  /*
  |--------------------------------------------------------------------------
  | MENU ITEMS
  |--------------------------------------------------------------------------
  */

  const menuItems = [
    {
      label: t("sidebar.home"),
      icon: <HomeSvg />,
      action: handleHome,
      disabled: false,
      active: true,
    },
    {
      label: t("sidebar.newAssessment"),
      icon: <AssessmentSvg />,
      action: handleAssessment,
      disabled: false,
      emphasis: true,
    },
    {
      label: t("sidebar.assessmentHistory"),
      icon: <HistorySvg />,
      action: goTo("/history"),
      disabled: false,
    },
    {
      label: t("sidebar.aiAssistant"),
      icon: <AIIcon />,
      action: goTo("/assistant"),
      disabled: false,
    },
    {
      label: t("sidebar.knowledgeSupport"),
      icon: <KnowledgeSvg />,
      action: goTo("/knowledge"),
      disabled: false,
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      label: t("sidebar.settings"),
      icon: <LanguageSvg />,
      disabled: false,
      action: openSettingsMenu,
    },
    {
      id: "logout",
      label: t("sidebar.logout"),
      icon: <LogoutSvg />,
      disabled: true,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <ScrollProgressBar />

      <Navbar sidebarOpen={sidebarOpen} />

      {/* =========================================================
          BACKGROUND OVERLAY
          ========================================================= */}
      {sidebarOpen && (
        <Box
          onClick={closeSidebar}
          sx={{
            position: "fixed",
            inset: 0,

            bgcolor:
              "rgba(15, 23, 42, 0.07)",

            backdropFilter:
              "blur(1.5px)",

            WebkitBackdropFilter:
              "blur(1.5px)",

            zIndex: 1040,
          }}
        />
      )}

      {/* =========================================================
          SIDEBAR
          ========================================================= */}
      <Box
        ref={sidebarRef}
        sx={{
          position: "fixed",

          top: 0,
          left: 0,
          bottom: 0,

          width: sidebarOpen
            ? {
              xs: 280,
              sm: 300,
              md: 310,
            }
            : {
              xs: 64,
              sm: 68,
              md: 72,
            },

          bgcolor:
            "rgba(255, 255, 255, 0.98)",

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",

          borderRight:
            "1px solid rgba(226, 232, 240, 0.9)",

          boxShadow: sidebarOpen
            ? "10px 0 35px rgba(15, 23, 42, 0.12)"
            : "3px 0 15px rgba(15, 23, 42, 0.06)",

          zIndex: 1050,

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",

          transition:
            "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* =======================================================
            SIDEBAR HEADER
            ======================================================= */}
        <Box
          sx={{
            height: {
              xs: 58,
              sm: 62,
              md: 64,
            },

            display: "flex",
            alignItems: "center",

            justifyContent: sidebarOpen
              ? "flex-start"
              : "center",

            px: sidebarOpen ? 1.25 : 0.5,

            flexShrink: 0,
          }}
        >
          <Tooltip
            title={
              sidebarOpen
                ? t("sidebar.closeMenu")
                : t("sidebar.openMenu")
            }
            placement="right"
          >
            <IconButton
              onClick={() =>
                setSidebarOpen(
                  (previous) => !previous
                )
              }
              aria-label={
                sidebarOpen
                  ? "close sidebar"
                  : "open sidebar"
              }
              sx={{
                width: 44,
                height: 44,

                color: sidebarOpen
                  ? "#2563EB"
                  : "#334155",

                bgcolor: sidebarOpen
                  ? "rgba(37, 99, 235, 0.08)"
                  : "transparent",

                border:
                  sidebarOpen
                    ? "1px solid rgba(37, 99, 235, 0.14)"
                    : "1px solid transparent",

                borderRadius: 2.5,

                "&:hover": {
                  bgcolor:
                    "rgba(37, 99, 235, 0.09)",
                },
              }}
            >
              <MenuSvg open={sidebarOpen} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* =======================================================
            MODERN USER PROFILE
            ======================================================= */}
        <Box
          onClick={() => {
            navigate("/dashboard");
            closeSidebar();
          }}
          sx={{
            minHeight: sidebarOpen
              ? 82
              : 68,

            display: "flex",
            alignItems: "center",

            justifyContent: sidebarOpen
              ? "flex-start"
              : "center",

            gap: 1.25,

            px: sidebarOpen ? 1.5 : 0.5,
            py: sidebarOpen ? 1.2 : 1,

            cursor: "pointer",

            position: "relative",

            transition:
              "background-color 0.2s ease",

            "&:hover": {
              bgcolor:
                "rgba(37, 99, 235, 0.055)",
            },
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Tooltip
              title={
                sidebarOpen
                  ? ""
                  : t("sidebar.userProfile")
              }
              placement="right"
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,

                  background:
                    "linear-gradient(135deg, #0B3B82 0%, #2563EB 55%, #38BDF8 100%)",

                  border:
                    "2px solid rgba(255,255,255,0.96)",

                  boxShadow:
                    "0 7px 18px rgba(37,99,235,0.24)",

                  fontSize: "0.7rem",

                  fontWeight: 800,

                  letterSpacing:
                    "0.04em",
                }}
              >
                OA
              </Avatar>
            </Tooltip>

            {/* Online / active indicator */}
            <Box
              sx={{
                position: "absolute",

                right: 0,
                bottom: 1,

                width: 10,
                height: 10,

                borderRadius: "50%",

                bgcolor: "#22C55E",

                border:
                  "2px solid #FFFFFF",

                boxShadow:
                  "0 2px 6px rgba(34,197,94,0.35)",
              }}
            />
          </Box>

          {/* Expanded profile information */}
          {sidebarOpen && (
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#0F172A",

                  fontWeight: 800,

                  fontSize: "0.92rem",

                  lineHeight: 1.25,

                  whiteSpace: "nowrap",

                  overflow: "hidden",

                  textOverflow: "ellipsis",
                }}
              >
                {t("sidebar.userProfile")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.65,

                  mt: 0.45,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,

                    borderRadius: "50%",

                    bgcolor: "#22C55E",
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",

                    fontSize: "0.73rem",

                    lineHeight: 1.2,

                    whiteSpace: "nowrap",
                  }}
                >
                  {t("sidebar.activeAccount")}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Expanded chevron */}
          {sidebarOpen && (
            <Box
              sx={{
                color: "#94A3B8",

                display: "flex",
                alignItems: "center",

                transition:
                  "color 0.2s ease",
              }}
            >
              <ChevronSvg />
            </Box>
          )}
        </Box>

        <Divider />

        {/* =======================================================
            NAVIGATION
            ======================================================= */}
        <Box
          sx={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List
            sx={{
              px: 0.75,
              py: 1.25,
            }}
          >
            {menuItems.map((item) => (
              <Tooltip
                key={item.label}
                title={
                  sidebarOpen
                    ? ""
                    : item.label
                }
                placement="right"
              >
                <span>
                  <ListItemButton
                    disabled={item.disabled}
                    onClick={item.action}
                    sx={{
                      minHeight: 52,

                      px: sidebarOpen
                        ? 1.5
                        : 0,

                      mb: 0.65,

                      borderRadius: 2.5,

                      justifyContent:
                        sidebarOpen
                          ? "flex-start"
                          : "center",

                      color: item.disabled
                        ? "#94A3B8"
                        : item.active
                          ? "#1D4ED8"
                          : "#334155",

                      bgcolor: item.active
                        ? "rgba(37, 99, 235, 0.10)"
                        : item.emphasis
                          ? "rgba(240, 249, 255, 0.72)"
                          : "transparent",

                      border:
                        "1px solid transparent",

                      borderColor:
                        item.active
                          ? "rgba(37, 99, 235, 0.16)"
                          : item.emphasis
                            ? "rgba(56, 189, 248, 0.18)"
                            : "transparent",

                      transition:
                        "all 0.2s ease",

                      "&:hover": {
                        bgcolor:
                          "rgba(37, 99, 235, 0.10)",

                        color: "#2563EB",

                        transform:
                          item.disabled
                            ? "none"
                            : "translateX(2px)",
                      },

                      "&.Mui-disabled": {
                        opacity: 0.48,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth:
                          sidebarOpen
                            ? 42
                            : 0,

                        width: sidebarOpen
                          ? 32
                          : 38,

                        height: sidebarOpen
                          ? 32
                          : 38,

                        borderRadius: 2,

                        bgcolor: item.active
                          ? "rgba(37, 99, 235, 0.14)"
                          : item.emphasis
                            ? "rgba(14, 165, 233, 0.12)"
                            : "transparent",

                        color: item.emphasis
                          ? "#0284C7"
                          : "inherit",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {sidebarOpen && (
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight:
                                item.active
                                  ? 700
                                  : 600,

                              fontSize:
                                "0.91rem",

                              whiteSpace:
                                "nowrap",
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </span>
              </Tooltip>
            ))}
          </List>

          {/* BOTTOM NAVIGATION */}
          <Box
            sx={{
              mt: "auto",
              px: 0.75,
              pb: 1.25,
            }}
          >
            <Divider sx={{ mb: 1 }} />

            {bottomItems.map((item) => (
              <Tooltip
                key={item.id}
                title={
                  sidebarOpen
                    ? ""
                    : item.label
                }
                placement="right"
              >
                <span>
                  <ListItemButton
                    disabled={item.disabled}
                    onClick={item.action}
                    sx={{
                      minHeight: 52,

                      px: sidebarOpen
                        ? 1.5
                        : 0,

                      mb: 0.4,

                      borderRadius: 2,

                      justifyContent:
                        sidebarOpen
                          ? "flex-start"
                          : "center",

                      color:
                        item.id === "logout"
                          ? "#EF4444"
                          : "#64748B",

                      "&.Mui-disabled": {
                        opacity: 0.48,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth:
                          sidebarOpen
                            ? 42
                            : 0,

                        justifyContent:
                          "center",

                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {sidebarOpen && (
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              fontSize:
                                "0.91rem",

                              color:
                                item.id ===
                                  "logout"
                                  ? "#EF4444"
                                  : "#475569",
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </span>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* SETTINGS POPOVER — Change Language */}
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={closeSettingsMenu}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                boxShadow: "0 18px 44px rgba(15, 23, 42, 0.12)",
                mb: 1,
              },
            },
          }}
        >
          <LanguageMenuItems onSelected={closeSettingsMenu} />
        </Menu>
      </Box>

      {/* =========================================================
          LANDING CONTENT
          ========================================================= */}
      <Hero />

      <FeaturesSection />

      <HowItWorks />

      <AboutSection />

      <Footer />
    </Box>
  );
}

export default LandingPage;