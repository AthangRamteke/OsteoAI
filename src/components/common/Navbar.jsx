import { useEffect, useRef, useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| OsteoAI Brand Mark
|--------------------------------------------------------------------------
*/

const OsteoLogo = ({ size = 40 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: 2.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#2563EB",
      color: "white",
      boxShadow:
        "0 5px 16px rgba(37, 99, 235, 0.20)",
      flexShrink: 0,
    }}
  >
    <svg
      width={size * 0.56}
      height={size * 0.56}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shield */}
      <path
        d="M12 2.8L19 5.8V11.5C19 16.1 16.1 19.5 12 21.2C7.9 19.5 5 16.1 5 11.5V5.8L12 2.8Z"
        fill="white"
        fillOpacity="0.98"
      />

      {/* Medical cross */}
      <path
        d="M10.1 7.6H13.9V10.1H16.4V13.9H13.9V16.4H10.1V13.9H7.6V10.1H10.1V7.6Z"
        fill="#2563EB"
      />
    </svg>
  </Box>
);

const MenuSvg = ({ open = false }) => (
  <svg
    width="23"
    height="23"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
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
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [navbarVisible, setNavbarVisible] =
    useState(true);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setNavbarVisible(true);
        lastScrollY.current =
          currentScrollY;
        return;
      }

      if (
        currentScrollY >
        lastScrollY.current
      ) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }

      lastScrollY.current =
        currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const section =
      document.getElementById(sectionId);

    if (!section) return;

    const heading =
      section.querySelector(
        "h1, h2, h3"
      );

    const target =
      heading || section;

    const navbarOffset = 92;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    const startPosition =
      window.scrollY;

    const distance =
      targetPosition -
      startPosition;

    const duration = 850;
    const startTime =
      performance.now();

    const easeInOut = (t) =>
      t < 0.5
        ? 2 * t * t
        : 1 -
          Math.pow(
            -2 * t + 2,
            2
          ) /
            2;

    const animateScroll = (
      currentTime
    ) => {
      const elapsed =
        currentTime -
        startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const easedProgress =
        easeInOut(progress);

      window.scrollTo(
        0,
        startPosition +
          distance *
            easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(
          animateScroll
        );
      }
    };

    setNavbarVisible(true);

    requestAnimationFrame(
      animateScroll
    );
  };

  const handleNavigation = (path) => {
    if (path.startsWith("/#")) {
      const sectionId =
        path.replace("/#", "");

      if (
        window.location.pathname ===
        "/"
      ) {
        scrollToSection(
          sectionId
        );
      } else {
        navigate("/");

        setTimeout(() => {
          scrollToSection(
            sectionId
          );
        }, 350);
      }

      setDrawerOpen(false);
      return;
    }

    navigate(path);
    setDrawerOpen(false);
  };

  const menuItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Features",
      path: "/#features",
    },
    {
      label: "How It Works",
      path: "/#how-it-works",
    },
    {
      label: "About",
      path: "/#about",
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 1100,

          pt: {
            xs: 1,
            md: 1.5,
          },

          px: {
            xs: 1,
            md: 2,
          },

          bgcolor:
            "transparent",

          transform:
            navbarVisible
              ? "translateY(0)"
              : "translateY(-120%)",

          transition:
            "transform 0.32s ease-in-out",
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            maxWidth: 1350,
            mx: "auto",

            minHeight:
              "64px !important",

            px: {
              xs: 1.5,
              md: 2.5,
            },

            py: 1,

            border:
              "1px solid rgba(226, 232, 240, 0.9)",

            borderRadius: 4,

            bgcolor:
              "rgba(255, 255, 255, 0.94)",

            backdropFilter:
              "blur(14px)",

            WebkitBackdropFilter:
              "blur(14px)",

            boxShadow:
              "0 8px 28px rgba(15, 23, 42, 0.05)",

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr auto",
              md: "1fr auto 1fr",
            },

            alignItems:
              "center",
          }}
        >
          {/* BRAND */}
          <Box
            onClick={() =>
              handleNavigation("/")
            }
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,

              cursor: "pointer",

              justifySelf:
                "start",
            }}
          >
            <OsteoLogo />

            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  lineHeight: 1,
                  letterSpacing:
                    "-0.02em",
                  color:
                    "#0F172A",
                }}
              >
                OsteoAI
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.4,
                  whiteSpace:
                    "nowrap",
                  lineHeight: 1,
                  color:
                    "#64748B",
                }}
              >
                Bone Health Intelligence
              </Typography>
            </Box>
          </Box>

          {/* DESKTOP NAVIGATION */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: 0.75,
              }}
            >
              {menuItems.map(
                (item) => (
                  <Button
                    key={
                      item.label
                    }
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
                    }
                    sx={{
                      px: 1.5,
                      py: 1,

                      minWidth:
                        "auto",

                      borderRadius: 2.5,

                      textTransform:
                        "none",

                      fontWeight: 600,

                      color:
                        "#0F172A",

                      whiteSpace:
                        "nowrap",

                      "&:hover": {
                        bgcolor:
                          "rgba(37, 99, 235, 0.06)",
                        color:
                          "#2563EB",
                      },
                    }}
                  >
                    {
                      item.label
                    }
                  </Button>
                )
              )}
            </Box>
          )}

          {/* AUTH BUTTONS */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "flex-end",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: "1px",
                  height: 28,
                  bgcolor:
                    "#E2E8F0",
                  mr: 0.5,
                }}
              />

              <Button
                variant="outlined"
                onClick={() =>
                  handleNavigation(
                    "/login"
                  )
                }
                sx={{
                  px: 2,
                  borderRadius:
                    2.5,
                  textTransform:
                    "none",
                  fontWeight: 700,
                  whiteSpace:
                    "nowrap",
                }}
              >
                Login
              </Button>

              <Button
                variant="contained"
                onClick={() =>
                  handleNavigation(
                    "/signup"
                  )
                }
                sx={{
                  px: 2,
                  borderRadius:
                    2.5,
                  textTransform:
                    "none",
                  fontWeight: 700,
                  whiteSpace:
                    "nowrap",
                  boxShadow:
                    "none",
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}

          {/* MOBILE MENU */}
          {isMobile && (
            <IconButton
              onClick={() =>
                setDrawerOpen(true)
              }
              aria-label="open navigation menu"
              sx={{
                justifySelf:
                  "end",
                color:
                  "#2563EB",
              }}
            >
              <MenuSvg />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      >
        <Box
          sx={{
            width: 300,
            height: "100%",
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "center",
                gap: 1,
              }}
            >
              <OsteoLogo
                size={32}
              />

              <Typography
                fontWeight={800}
                sx={{
                  color:
                    "#0F172A",
                }}
              >
                OsteoAI
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setDrawerOpen(
                  false
                )
              }
              aria-label="close navigation menu"
            >
              <MenuSvg open />
            </IconButton>
          </Box>

          <Divider
            sx={{ mb: 1 }}
          />

          <List>
            {menuItems.map(
              (item) => (
                <ListItem
                  key={
                    item.label
                  }
                  disablePadding
                >
                  <ListItemButton
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
                    }
                    sx={{
                      borderRadius:
                        2,
                      mb: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        item.label
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            )}

            <ListItem
              disablePadding
            >
              <ListItemButton
                onClick={() =>
                  handleNavigation(
                    "/login"
                  )
                }
                sx={{
                  borderRadius:
                    2,
                  mt: 1,
                }}
              >
                <ListItemText
                  primary="Login"
                />
              </ListItemButton>
            </ListItem>

            <ListItem
              disablePadding
            >
              <ListItemButton
                onClick={() =>
                  handleNavigation(
                    "/signup"
                  )
                }
                sx={{
                  borderRadius:
                    2,
                  mt: 0.5,
                  bgcolor:
                    "primary.main",
                  color:
                    "white",
                  "&:hover": {
                    bgcolor:
                      "primary.dark",
                  },
                }}
              >
                <ListItemText
                  primary="Sign Up"
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;