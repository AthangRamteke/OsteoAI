import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/authContext";
import PasswordField from "./PasswordField";
import { authErrorKey } from "./authErrors";

function RegisterForm({ onSwitch }) {
  const { t } = useLanguage();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);
  const [errorKey, setErrorKey] =
    useState(null);

  // No length or complexity rules: any non-empty password, typed the
  // same way twice, is accepted.
  const passwordsMatch =
    password !== "" &&
    password === confirmPassword;

  const isValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    passwordsMatch;

  const editField = (setter) => (event) => {
    setter(event.target.value);
    setErrorKey(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorKey(null);

    try {
      // On success GuestRoute redirects away from this page.
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorKey(authErrorKey(error));
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          color: "var(--oa-text-900)",
        }}
      >
        {t("auth.registerTitle")}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "var(--oa-text-500)",
        }}
      >
        {t("auth.registerDesc")}
      </Typography>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2.25,
        }}
      >
        {errorKey && (
          <Alert severity="error" role="alert">
            {t(errorKey)}
          </Alert>
        )}

        <TextField
          fullWidth
          label={t("auth.fullNameLabel")}
          name="name"
          autoComplete="name"
          value={name}
          onChange={editField(setName)}
          disabled={submitting}
        />

        <TextField
          fullWidth
          label={t("auth.emailLabel")}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={editField(setEmail)}
          disabled={submitting}
        />

        <PasswordField
          label={t("auth.passwordLabel")}
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={editField(setPassword)}
          disabled={submitting}
        />

        <PasswordField
          label={t("auth.confirmPasswordLabel")}
          name="confirm-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={editField(setConfirmPassword)}
          disabled={submitting}
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
          disabled={!isValid || submitting}
          startIcon={
            submitting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : null
          }
          sx={{
            py: 1.35,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: "none",
          }}
        >
          {submitting
            ? t("auth.creatingAccount")
            : t("auth.createAccount")}
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "var(--oa-text-500)",
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
