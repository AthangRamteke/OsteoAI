import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

function Navbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          py: 1,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
        >
          🦴 OsteoAI
        </Typography>

        <Box>
          <Button color="inherit">Home</Button>
          <Button color="inherit">Features</Button>
          <Button color="inherit">About</Button>

          <Button
            variant="contained"
            sx={{ ml: 2 }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;