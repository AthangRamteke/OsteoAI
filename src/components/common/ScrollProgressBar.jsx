import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

// Perf note: this bar used to track scroll with React state (setProgress)
// and animate the CSS `width` property. Both are expensive on every scroll
// tick — `width` triggers layout/reflow, and a state update on every raw
// scroll event re-renders the component far more often than the screen can
// paint, which is what caused the visible lag while scrolling. This version
// writes directly to the DOM node's `transform` (GPU-composited, no layout)
// and throttles updates to once per animation frame, so it never falls
// behind the browser's own scroll handling.
function ScrollProgressBar() {
  const barRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      rafId.current = null;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${scrolled})`;
      }
    };

    const handleScroll = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 3,
        zIndex: 2000,
        bgcolor: "transparent",
        pointerEvents: "none",
      }}
    >
      <Box
        ref={barRef}
        sx={{
          height: "100%",
          width: "100%",
          transformOrigin: "0% 50%",
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, #2563EB 0%, #6366F1 100%)",
          willChange: "transform",
        }}
      />
    </Box>
  );
}

export default ScrollProgressBar;