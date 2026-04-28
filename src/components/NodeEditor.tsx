import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Divider,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Link,
  Delete,
  Edit,
  AccountTree,
  InfoOutlined,
  LocalOfferOutlined,
  PaletteOutlined,
  NotesRounded,
  AutoAwesome,
} from "@mui/icons-material";
import type { StoryNode } from "../types";

interface Props {
  selectedNode: StoryNode | null;
  nodes: StoryNode[];
  onUpdateNode: (nodeId: string, updates: Partial<StoryNode>) => void;
  onAddChild: (label: string) => void;
  onConnectTo: (targetId: string) => void;
  onDeleteNode: () => void;
  onOpenDescription: (nodeId: string) => void;
}

interface SelectedNodeEditorProps {
  selectedNode: StoryNode;
  nodes: StoryNode[];
  onUpdateNode: (nodeId: string, updates: Partial<StoryNode>) => void;
  onAddChild: (label: string) => void;
  onConnectTo: (targetId: string) => void;
  onDeleteNode: () => void;
  onOpenDescription: (nodeId: string) => void;
}

const colorPalette = [
  "#8b5cf6",
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

const SelectedNodeEditor: React.FC<SelectedNodeEditorProps> = ({
  selectedNode,
  nodes,
  onUpdateNode,
  onAddChild,
  onConnectTo,
  onDeleteNode,
  onOpenDescription,
}) => {
  const [editLabel, setEditLabel] = useState<string>(selectedNode.label ?? "");
  const [editBadge, setEditBadge] = useState<string>(selectedNode.badge ?? "");
  const [editDescription, setEditDescription] = useState<string>(
    selectedNode.description ?? ""
  );
  const [childLabel, setChildLabel] = useState<string>("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const handleSaveMeta = () => {
    onUpdateNode(selectedNode.id, {
      label: editLabel.trim() || "Untitled step",
      badge: editBadge.trim(),
    });
  };

  const handleSaveDescription = () => {
    onUpdateNode(selectedNode.id, {
      description: editDescription.trim(),
    });
  };

  const handleAddChild = () => {
    onAddChild(childLabel.trim() || "New step");
    setChildLabel("");
  };

  const handleConnectTo = () => {
    if (selectedTargetId && selectedNode.id !== selectedTargetId) {
      onConnectTo(selectedTargetId);
      setSelectedTargetId("");
    }
  };

  const otherNodes = nodes.filter((n) => n.id !== selectedNode.id);

  return (
    <Fade in={true}>
      <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Box sx={{ p: { xs: 1.5, md: 2 }, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              mb: 2.5,
              minWidth: 0,
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: `${selectedNode.color || "#6366f1"}22`,
                color: selectedNode.color || "#6366f1",
                width: 48,
                height: 48,
              }}
            >
              <Edit />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Edit selected step
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ mt: 0.75, flexWrap: "wrap", minWidth: 0 }}
              >
                <Chip
                  label={selectedNode.badge?.trim() || "No label"}
                  size="small"
                  sx={{ maxWidth: "100%" }}
                />
                <Chip
                  label={`ID: ${selectedNode.id.slice(-8)}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Step title"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleSaveMeta}
            onKeyDown={(e) => e.key === "Enter" && handleSaveMeta()}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Edit fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment:
                  (editLabel !== selectedNode.label ||
                    editBadge !== (selectedNode.badge ?? "")) &&
                  editLabel.trim() ? (
                    <Tooltip title="Save">
                      <IconButton size="small" onClick={handleSaveMeta} edge="end">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null,
              },
            }}
          />

          <TextField
            fullWidth
            label="Label"
            value={editBadge}
            onChange={(e) => setEditBadge(e.target.value)}
            onBlur={handleSaveMeta}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferOutlined fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08))",
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1.5, alignItems: "center" }}
            >
              <PaletteOutlined sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Node color
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))",
                gap: 1,
                alignItems: "center",
              }}
            >
              {colorPalette.map((color) => (
                <IconButton
                  key={color}
                  onClick={() => onUpdateNode(selectedNode.id, { color })}
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    bgcolor: color,
                    border: "2px solid",
                    borderColor:
                      selectedNode.color === color
                        ? "common.white"
                        : "transparent",
                    boxShadow: `0 0 0 2px ${color}33`,
                    "&:hover": {
                      bgcolor: color,
                      transform: "translateY(-2px)",
                    },
                  }}
                />
              ))}
              <Box
                component="input"
                type="color"
                aria-label="Pick node color"
                value={selectedNode.color || "#6366f1"}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, { color: e.target.value })
                }
                sx={{
                  width: "100%",
                  minWidth: 0,
                  height: 40,
                  p: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <NotesRounded sx={{ fontSize: 20, color: "secondary.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Step description
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            placeholder="Write details, dialog, conditions, or notes for this step..."
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            sx={{ mb: 1.5 }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              onClick={handleSaveDescription}
              startIcon={<NotesRounded />}
              fullWidth
            >
              Save description
            </Button>
            <Button
              variant="outlined"
              onClick={() => onOpenDescription(selectedNode.id)}
              startIcon={<InfoOutlined />}
              fullWidth
            >
              Open details
            </Button>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Add sx={{ fontSize: 20, color: "success.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Add new step
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 3 }}
          >
            <TextField
              fullWidth
              placeholder="Next step name..."
              value={childLabel}
              onChange={(e) => setChildLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
            />
            <Button
              variant="contained"
              onClick={handleAddChild}
              startIcon={<Add />}
              sx={{ whiteSpace: "nowrap" }}
              fullWidth
            >
              Create
            </Button>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Link sx={{ fontSize: 20, color: "secondary.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Connect to another step
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 3 }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Select target step</InputLabel>
              <Select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                label="Select target step"
              >
                <MenuItem value="">Select...</MenuItem>
                {otherNodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.label}
                    {node.badge ? ` — ${node.badge}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleConnectTo}
              disabled={!selectedTargetId}
              startIcon={<Link />}
              fullWidth
            >
              Connect
            </Button>
          </Stack>

          <Alert severity="info" sx={{ mb: 3, fontSize: 12, borderRadius: 3 }}>
            <strong>Tip:</strong> Add a short label and a full description for
            each node to keep the canvas easier to scan.
          </Alert>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderRadius: 3,
              bgcolor: "action.hover",
              mb: 2,
            }}
          >
            <AutoAwesome sx={{ color: "warning.main" }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Current preview: <strong>{editLabel || "Untitled step"}</strong>
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onDeleteNode}
            sx={{ mt: 1 }}
          >
            Delete this step
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

const NodeEditor: React.FC<Props> = ({
  selectedNode,
  nodes,
  onUpdateNode,
  onAddChild,
  onConnectTo,
  onDeleteNode,
  onOpenDescription,
}) => {
  if (!selectedNode) {
    return (
      <Fade in={true}>
        <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0, textAlign: "center" }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "transparent",
              minWidth: 0,
            }}
          >
            <AccountTree
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              Story control panel
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Select a node on the canvas to manage its color, description,
              label, and connections.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Available features
            </Typography>
            <Stack
              spacing={1.25}
              sx={{ textAlign: "left", fontSize: 13, color: "text.secondary" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="Color"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2">
                  Pick a custom color for every node from a quick palette.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="Details"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Typography variant="body2">
                  Add a description and open it in a focused details view.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="Label"
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <Typography variant="body2">
                  Add short labels to organize each step.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="Drag"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Typography variant="body2">
                  Drag nodes with smooth zoom and pan on the canvas.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Fade>
    );
  }

  return (
    <SelectedNodeEditor
      key={selectedNode.id}
      selectedNode={selectedNode}
      nodes={nodes}
      onUpdateNode={onUpdateNode}
      onAddChild={onAddChild}
      onConnectTo={onConnectTo}
      onDeleteNode={onDeleteNode}
      onOpenDescription={onOpenDescription}
    />
  );
};

export default NodeEditor;
