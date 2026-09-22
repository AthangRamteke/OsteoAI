import { useState } from "react";

import {
  Box,
  Button,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";

function RegisterForm({ onSwitch }) {
  const { t } = useLanguage();

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
        {t("auth.registerTitle")}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "#64748B",
        }}
      >
        {t("auth.registerDesc")}
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
          label={t("auth.fullNameLabel")}
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <TextField
          fullWidth
          label={t("auth.emailLabel")}
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />

        <TextField
          fullWidth
          label={t("auth.passwordLabel")}
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          helperText={t("auth.passwordHelper")}
        />

        {password && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
              }}
            >
              {t("auth.passwordStrength")}
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
          label={t("auth.confirmPasswordLabel")}
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
              ? t("auth.passwordMismatch")
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
          {t("auth.createAccount")}
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "#64748B",
        }}
      >
        {t("auth.alreadyRegistered")}{" "}
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
          {t("auth.signIn")}
        </Button>
      </Typography>
    </Box>
  );
}

export default RegisterForm;