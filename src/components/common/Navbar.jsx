import { useState } from "react";
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

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);

    if (!element) {
      return;
    }

    const navbarOffset = 96;
    const targetPosition =
      element.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 850;
    const startTime = performance.now();

    const easeInOut = (t) => {
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOut(progress);

      window.scrollTo(
        0,
        startPosition + distance * easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handleNavigation = (path) => {
    if (path.startsWith("/#")) {
      const sectionId = path.replace("/#", "");

      if (window.location.pathname === "/") {
        scrollToSection(sectionId);
      } else {
        navigate("/");

        setTimeout(() => {
          scrollToSection(sectionId);
        }, 300);
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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        pt: { xs: 1, md: 1.5 },
        px: { xs: 1, md: 2 },
        bgcolor: "transparent",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: 1350,
          mx: "auto",
          minHeight: "64px !important",
          px: { xs: 1.5, md: 2.5 },
          py: 1,
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: 4,
          bgcolor: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 8px 28px rgba(15, 23, 42, 0.05)",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr auto",
            md: "1fr auto 1fr",
          },
          alignItems: "center",
        }}
      >
        {/* BRAND */}
        <Box
          onClick={() => handleNavigation("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            cursor: "pointer",
            justifySelf: "start",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "white",
              boxShadow:
                "0 5px 16px rgba(37, 99, 235, 0.18)",
              flexShrink: 0,
            }}
          >
            <HealthAndSafetyIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#0F172A",
              }}
            >
              OsteoAI
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.4,
                whiteSpace: "nowrap",
                lineHeight: 1,
                color: "#64748B",
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
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  px: 1.5,
                  py: 1,
                  minWidth: "auto",
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#0F172A",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "rgba(37, 99, 235, 0.06)",
                    color: "#2563EB",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* AUTH */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: "1px",
                height: "28px",
                bgcolor: "#E2E8F0",
                mr: 0.5,
              }}
            />

            <Button
              variant="outlined"
              onClick={() => handleNavigation("/login")}
              sx={{
                px: 2,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Login
            </Button>

            <Button
              variant="contained"
              onClick={() => handleNavigation("/login")}
              sx={{
                px: 2,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: "none",
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}

        {/* MOBILE MENU */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            aria-label="open navigation menu"
            color="primary"
            sx={{
              justifySelf: "end",
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HealthAndSafetyIcon color="primary" />

              <Typography
                fontWeight={800}
                sx={{
                  color: "#0F172A",
                }}
              >
                OsteoAI
              </Typography>
            </Box>

            <IconButton
              onClick={() => setDrawerOpen(false)}
              aria-label="close navigation menu"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.label}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation("/login")}
                sx={{
                  borderRadius: 2,
                  mt: 1,
                }}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation("/login")}
                sx={{
                  borderRadius: 2,
                  mt: 0.5,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default Navbar;