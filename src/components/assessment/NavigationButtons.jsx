import { Box, Button } from "@mui/material";

function NavigationButtons() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mt: 4,
      }}
    >
      <Button variant="contained">
        Next
      </Button>
    </Box>
  );
}

export default NavigationButtons;