import { useState } from "react";

import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DisabledVisibleIcon from "@mui/icons-material/DisabledVisible";

import { useLanguage } from "../../context/LanguageContext";

/** Password input with the show/hide eye toggle. */
function PasswordField(props) {
  const { t } = useLanguage();

  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <TextField
      fullWidth
      {...props}
      type={showPassword ? "text" : "password"}
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
                aria-label={
                  showPassword
                    ? t("auth.hidePassword")
                    : t("auth.showPassword")
                }
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
  );
}

export default PasswordField;
