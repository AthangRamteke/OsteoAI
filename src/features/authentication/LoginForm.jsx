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

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DisabledVisibleIcon from "@mui/icons-material/DisabledVisible";

import { useLanguage } from "../../context/LanguageContext";

function LoginForm({ onSwitch }) {
  const { t } = useLanguage();

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
        {t("auth.loginTitle")}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "#64748B",
        }}
      >
        {t("auth.loginDesc")}
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
                      <DisabledVisibleIcon />
                    ) : (
                      <RemoveRedEyeIcon />
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
            label={t("auth.rememberMe")}
          />

          <Button
            variant="text"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              p: 0.5,
            }}
          >
            {t("auth.forgotPassword")}
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
          {t("auth.signIn")}
        </Button>
      </Box>

      <Typography
        align="center"
        sx={{
          mt: 4,
          color: "#64748B",
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
