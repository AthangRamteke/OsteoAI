import { useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function LoginForm({ onSwitch }) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid =
    email.trim() !== "" &&
    password.trim() !== "";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    // Backend authentication will be connected later.
  };

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          color: "#0F172A",
        }}
      >
        Welcome back
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "#64748B",
        }}
      >
        Sign in to continue to your OsteoAI account.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2.25,
        }}
      >
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <FormControlLabel
            control={<Checkbox />}
            label="Remember me"
          />

          <Button
            variant="text"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              p: 0.5,
            }}
          >
            Forgot Password?
          </Button>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={!isValid}
          sx={{
            py: 1.35,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: "none",
          }}
        >
          Sign In
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "#64748B",
        }}
      >
        Don't have an account?{" "}
        <Button
          onClick={onSwitch}
          sx={{
            minWidth: "auto",
            p: 0,
            textTransform: "none",
            fontWeight: 700,
            verticalAlign: "baseline",
          }}
        >
          Sign Up
        </Button>
      </Typography>
    </Box>
  );
}

export default LoginForm;