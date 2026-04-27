import React from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Switch,
  Stack,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Timeline,
  AccountTree,
  HubOutlined,
} from "@mui/icons-material";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
  nodesCount: number;
  connectionsCount: number;
}

const Navbar: React.FC<Props> = ({
  mode,
  onToggleTheme,
  nodesCount,
  connectionsCount,
}) => {
  return (
    <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: { xs: 1.5, md: 2.5 } }}>
      <Paper
        elevation={0}
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderRadius: 8,
          backgroundImage: "none",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3.5,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <AccountTree color="primary" />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #818cf8, #f472b6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Story Flow Canvas
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ویرایش گره‌ها، رنگ‌ها، توضیحات و لیبل‌ها در یک نمای تمیز
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Chip
              icon={<Timeline />}
              label={`${nodesCount} گره`}
              variant="outlined"
            />
            <Chip
              icon={<HubOutlined />}
              label={`${connectionsCount} اتصال`}
              variant="outlined"
            />
            <Chip
              icon={mode === "dark" ? <Brightness4 /> : <Brightness7 />}
              label={mode === "dark" ? "حالت شب" : "حالت روشن"}
              onClick={onToggleTheme}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 700 }}
              deleteIcon={
                <Switch checked={mode === "dark"} onChange={onToggleTheme} />
              }
              onDelete={onToggleTheme}
            />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Navbar;
