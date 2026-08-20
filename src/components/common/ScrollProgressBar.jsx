import { useState, useEffect } from "react";
import { Box } from "@mui/material";

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
        sx={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, #2563EB 0%, #6366F1 100%)",
          transition: "width 0.1s linear",
        }}
      />
    </Box>
  );
}

export default ScrollProgressBar;