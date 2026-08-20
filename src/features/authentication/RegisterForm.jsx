import { useState } from "react";

import {
  Box,
  Button,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

function RegisterForm({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const getPasswordScore = () => {
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    return score;
  };

  const passwordScore =
    getPasswordScore();

  const passwordsMatch =
    password !== "" &&
    password === confirmPassword;

  const isValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 8 &&
    passwordsMatch;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    // Backend registration will be connected later.
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
        Create your account
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "#64748B",
        }}
      >
        Start your personalized OsteoAI experience.
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
          label="Full Name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

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
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          helperText="Use at least 8 characters."
        />

        {password && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
              }}
            >
              Password strength
            </Typography>

            <LinearProgress
              variant="determinate"
              value={passwordScore * 25}
              sx={{
                mt: 0.75,
                height: 7,
                borderRadius: 999,
              }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          error={
            confirmPassword !== "" &&
            !passwordsMatch
          }
          helperText={
            confirmPassword !== "" &&
            !passwordsMatch
              ? "Passwords do not match."
              : ""
          }
        />

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
          Create Free Account
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "#64748B",
        }}
      >
        Already registered?{" "}
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
          Sign In
        </Button>
      </Typography>
    </Box>
  );
}

export default RegisterForm;