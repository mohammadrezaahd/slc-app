// components/Navbar.tsx - اصلاح شده
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Timeline,
  AccountTree,
} from "@mui/icons-material";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const Navbar: React.FC<Props> = ({ mode, onToggleTheme }) => {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={1}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTree color="primary" />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Feri Story
          </Typography>
        </Box>

        <Chip
          icon={<Timeline />}
          label="ساختار درختی داستان"
          size="small"
          variant="outlined"
          sx={{ mr: 2 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <FormControlLabel
          control={
            <Switch checked={mode === "dark"} onChange={onToggleTheme} />
          }
          label={
            mode === "dark" ? (
              <Brightness4 sx={{ fontSize: 20 }} />
            ) : (
              <Brightness7 sx={{ fontSize: 20 }} />
            )
          }
          labelPlacement="start"
        />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
