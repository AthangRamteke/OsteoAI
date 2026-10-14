import { Box, Tooltip } from "@mui/material";

import { useThemeMode } from "../../context/ThemeModeContext";

/*
 * Day / night switch.
 *
 * A small sky-in-a-pill: the knob is the sun or moon, the track turns
 * from daytime blue to a starry night, and the clouds drift across as
 * it slides. Purely CSS, so it costs nothing to render.
 */
function ThemeToggle({ size = "normal" }) {
  const { mode, toggleMode } = useThemeMode();
  const dark = mode === "dark";

  const width = size === "small" ? 56 : 64;
  const height = size === "small" ? 28 : 32;
  const knob = height - 6;

  return (
    <Tooltip title={dark ? "Light mode" : "Dark mode"}>
      <Box
        role="switch"
        aria-checked={dark}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        tabIndex={0}
        onClick={toggleMode}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMode();
          }
        }}
        sx={{
          position: "relative",
          width,
          height,
          flexShrink: 0,
          borderRadius: 99,
          cursor: "pointer",
          overflow: "hidden",
          border: "1px solid",
          borderColor: dark ? "rgba(148,170,205,0.28)" : "rgba(37,99,235,0.18)",
          background: dark
            ? "linear-gradient(180deg, #1e2a4a 0%, #0f1733 100%)"
            : "linear-gradient(180deg, #9fd4ff 0%, #d9f0ff 100%)",
          boxShadow: dark
            ? "inset 0 2px 6px rgba(0,0,0,0.55)"
            : "inset 0 2px 6px rgba(37,99,235,0.18)",
          transition: "background 450ms ease, border-color 450ms ease",
          "&:focus-visible": {
            outline: "2px solid var(--oa-brand)",
            outlineOffset: 2,
          },
        }}
      >
        {/* Stars, only at night */}
        {[
          { top: "22%", left: "22%", size: 2 },
          { top: "38%", left: "38%", size: 1.5 },
          { top: "18%", left: "50%", size: 1.5 },
          { top: "55%", left: "30%", size: 1.5 },
        ].map((star) => (
          <Box
            key={`${star.top}-${star.left}`}
            sx={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
              opacity: dark ? 0.9 : 0,
              transition: "opacity 450ms ease",
            }}
          />
        ))}

        {/* Clouds drift aside at night */}
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: dark ? "18%" : "30%",
            display: "flex",
            alignItems: "flex-end",
            gap: "2px",
            opacity: dark ? 0.55 : 0.95,
            transition: "left 500ms cubic-bezier(0.4,0,0.2,1), opacity 450ms ease",
          }}
        >
          {[7, 10, 6].map((cloud, index) => (
            <Box
              key={index}
              sx={{
                width: cloud,
                height: cloud * 0.7,
                borderRadius: "50% 50% 45% 45%",
                bgcolor: "#FFFFFF",
                filter: "blur(0.2px)",
              }}
            />
          ))}
        </Box>

        {/* The sun / moon knob */}
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: dark ? width - knob - 4 : 2,
            width: knob,
            height: knob,
            borderRadius: "50%",
            background: dark
              ? "radial-gradient(circle at 35% 35%, #ffffff 0%, #e8eefc 70%)"
              : "radial-gradient(circle at 35% 35%, #fffdf2 0%, #ffe9a8 75%)",
            boxShadow: dark
              ? "0 0 10px 2px rgba(226,232,240,0.75)"
              : "0 0 10px 2px rgba(253,224,71,0.8)",
            transition: "left 480ms cubic-bezier(0.4,0,0.2,1), background 450ms ease, box-shadow 450ms ease",
          }}
        />
      </Box>
    </Tooltip>
  );
}

export default ThemeToggle;
