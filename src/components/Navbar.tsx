import React from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Switch,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Timeline,
  AccountTree,
  HubOutlined,
  DownloadRounded,
  UploadRounded,
  TuneRounded,
} from "@mui/icons-material";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
  nodesCount: number;
  connectionsCount: number;
  onExportCanvas: () => void;
  onImportCanvas: (file: File) => void;
  onOpenNodeSettings: () => void;
}

const Navbar: React.FC<Props> = ({
  mode,
  onToggleTheme,
  nodesCount,
  connectionsCount,
  onExportCanvas,
  onImportCanvas,
  onOpenNodeSettings,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onImportCanvas(file);
    event.target.value = "";
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2.5 }, pt: { xs: 1, md: 2.5 } }}>
      <Paper
        elevation={0}
        sx={{
          px: { xs: 1.5, md: 3 },
          py: { xs: 1, md: 1.5 },
          borderRadius: { xs: "14px", md: "18px" },
          backgroundImage: "none",
        }}
      >
        {/* ── hidden file input ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* ── MOBILE ROW ── */}
        <Stack
          direction="row"
          sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between" }}
        >
          {/* logo */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))",
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              <AccountTree color="primary" sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #818cf8, #f472b6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                lineHeight: 1,
              }}
            >
              Story Flow
            </Typography>
          </Stack>

          {/* right actions */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Tooltip title={`${nodesCount} Nodes · ${connectionsCount} Connections`}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  height: 30,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "default",
                }}
              >
                <Timeline sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
                  {nodesCount}
                </Typography>
                <HubOutlined sx={{ fontSize: 14, color: "text.secondary", ml: 0.25 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
                  {connectionsCount}
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton size="small" onClick={onToggleTheme} sx={{ borderRadius: "8px" }}>
                {mode === "dark" ? (
                  <Brightness7 fontSize="small" />
                ) : (
                  <Brightness4 fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Import canvas">
              <IconButton size="small" onClick={handleImportClick} sx={{ borderRadius: "8px" }}>
                <UploadRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Node settings">
              <IconButton size="small" onClick={onOpenNodeSettings} sx={{ borderRadius: "8px" }}>
                <TuneRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export canvas">
              <IconButton
                size="small"
                onClick={onExportCanvas}
                color="primary"
                sx={{ borderRadius: "8px" }}
              >
                <DownloadRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* ── DESKTOP ROW ── */}
        <Stack
          direction="row"
          sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "space-between" }}
        >
          {/* logo */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "11px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))",
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              <AccountTree color="primary" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.2,
                  background: "linear-gradient(135deg, #818cf8, #f472b6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Story Flow Canvas
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Edit nodes, colors, descriptions and labels
              </Typography>
            </Box>
          </Stack>

          {/* right controls */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              icon={<Timeline />}
              label={`${nodesCount} Nodes`}
              variant="outlined"
              size="small"
              sx={{ height: 32 }}
            />
            <Chip
              icon={<HubOutlined />}
              label={`${connectionsCount} Connections`}
              variant="outlined"
              size="small"
              sx={{ height: 32 }}
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box
              sx={{
                height: 32,
                px: 1.25,
                borderRadius: "9px",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              {mode === "dark" ? (
                <Brightness4 fontSize="small" color="primary" />
              ) : (
                <Brightness7 fontSize="small" color="primary" />
              )}
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {mode === "dark" ? "Dark" : "Light"}
              </Typography>
              <Switch size="small" checked={mode === "dark"} onChange={onToggleTheme} />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadRounded />}
              onClick={handleImportClick}
              sx={{ height: 32, borderRadius: "9px" }}
            >
              Import
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadRounded />}
              onClick={onExportCanvas}
              sx={{ height: 32, borderRadius: "9px" }}
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Navbar;
