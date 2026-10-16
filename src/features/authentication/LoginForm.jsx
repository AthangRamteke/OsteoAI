import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/authContext";
import PasswordField from "./PasswordField";
import { authErrorKey } from "./authErrors";

function LoginForm({ onSwitch }) {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);
  const [errorKey, setErrorKey] =
    useState(null);

  // Any non-empty password is accepted.
  const isValid =
    email.trim() !== "" &&
    password !== "";

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
      await login({
        email: email.trim(),
        password,
        remember,
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
        {t("auth.loginTitle")}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "var(--oa-text-500)",
        }}
      >
        {t("auth.loginDesc")}
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
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={editField(setPassword)}
          disabled={submitting}
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
            control={
              <Checkbox
                checked={remember}
                onChange={(event) =>
                  setRemember(event.target.checked)
                }
                disabled={submitting}
              />
            }
            label={t("auth.rememberMe")}
          />
        </Box>

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
            ? t("auth.signingIn")
            : t("auth.signIn")}
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "var(--oa-text-500)",
        }}
      >
        {t("auth.noAccount")}{" "}
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
          {t("auth.signUp")}
        </Button>
      </Typography>
    </Box>
  );
}

export default LoginForm;
