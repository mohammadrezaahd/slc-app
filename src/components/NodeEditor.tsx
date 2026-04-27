import React, { useState } from "react";
import {
  Paper,
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

const NodeEditor: React.FC<Props> = ({
  selectedNode,
  nodes,
  onUpdateNode,
  onAddChild,
  onConnectTo,
  onDeleteNode,
  onOpenDescription,
}) => {
  const [editLabel, setEditLabel] = useState<string>("");
  const [editBadge, setEditBadge] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [childLabel, setChildLabel] = useState<string>("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  React.useEffect(() => {
    setEditLabel(selectedNode?.label ?? "");
    setEditBadge(selectedNode?.badge ?? "");
    setEditDescription(selectedNode?.description ?? "");
  }, [selectedNode]);

  const handleSaveMeta = () => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        label: editLabel.trim() || "مرحله بدون عنوان",
        badge: editBadge.trim(),
      });
    }
  };

  const handleSaveDescription = () => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        description: editDescription.trim(),
      });
    }
  };

  const handleAddChild = () => {
    if (selectedNode) {
      onAddChild(childLabel.trim() || `مرحله جدید`);
      setChildLabel("");
    }
  };

  const handleConnectTo = () => {
    if (
      selectedNode &&
      selectedTargetId &&
      selectedNode.id !== selectedTargetId
    ) {
      onConnectTo(selectedTargetId);
      setSelectedTargetId("");
    }
  };

  if (!selectedNode) {
    return (
      <Fade in={true}>
        <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 6,
              bgcolor: "background.paper",
              minWidth: 0,
            }}
          >
            <AccountTree
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              پنل کنترل داستان
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              یک گره را از روی بوم انتخاب کن تا رنگ، توضیح، لیبل و ارتباطاتش را مدیریت کنی.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              قابلیت‌های جدید
            </Typography>
            <Stack
              spacing={1.25}
              sx={{ textAlign: "right", fontSize: 13, color: "text.secondary" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="رنگ"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2">
                  انتخاب رنگ سفارشی برای هر گره با پالت آماده
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="شرح"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Typography variant="body2">
                  افزودن توضیح و باز کردن آن در نمای مستقل
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
                  تعریف لیبل کوتاه برای دسته‌بندی هر مرحله
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
                  جابجایی گره‌ها، زوم و پن نرم روی بوم
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  const otherNodes = nodes.filter((n) => n.id !== selectedNode.id);

  return (
    <Fade in={true}>
      <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 6, bgcolor: "background.paper", minWidth: 0 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 2.5, minWidth: 0 }}
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
                ویرایش مرحله انتخاب‌شده
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ mt: 0.75, flexWrap: "wrap", minWidth: 0 }}
              >
                <Chip
                  label={selectedNode.badge?.trim() || "بدون لیبل"}
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
            label="عنوان گره"
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
                    <Tooltip title="ذخیره">
                      <IconButton
                        size="small"
                        onClick={handleSaveMeta}
                        edge="end"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null,
              },
            }}
          />

          <TextField
            fullWidth
            label="Label / برچسب"
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
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08))",
              mb: 3,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <PaletteOutlined sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                رنگ گره
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
                      selectedNode.color === color ? "common.white" : "transparent",
                    boxShadow: `0 0 0 2px ${color}33`,
                    "&:hover": { bgcolor: color, transform: "translateY(-2px)" },
                  }}
                />
              ))}
              <Box
                component="input"
                type="color"
                aria-label="انتخاب رنگ گره"
                value={selectedNode.color || "#6366f1"}
                onChange={(e) => onUpdateNode(selectedNode.id, { color: e.target.value })}
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
              توضیحات مرحله
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            placeholder="جزئیات، دیالوگ، شرط‌ها یا نکته‌های این مرحله را بنویس..."
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
              ذخیره توضیحات
            </Button>
            <Button
              variant="outlined"
              onClick={() => onOpenDescription(selectedNode.id)}
              startIcon={<InfoOutlined />}
              fullWidth
            >
              باز کردن توضیحات
            </Button>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Add sx={{ fontSize: 20, color: "success.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              افزودن مرحله جدید
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="نام مرحله بعدی..."
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
              ایجاد
            </Button>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Link sx={{ fontSize: 20, color: "secondary.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              اتصال به مرحله دیگر
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>انتخاب مرحله مقصد</InputLabel>
              <Select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                label="انتخاب مرحله مقصد"
              >
                <MenuItem value="">انتخاب کنید...</MenuItem>
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
              اتصال
            </Button>
          </Stack>

          <Alert severity="info" sx={{ mb: 3, fontSize: 12, borderRadius: 3 }}>
            <strong>نکته:</strong> برای هر گره می‌توانی یک لیبل کوتاه و یک توضیح کامل ثبت کنی تا روی بوم هم خواناتر شود.
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
              پیش‌نمایش فعلی: <strong>{editLabel || "مرحله بدون عنوان"}</strong>
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
            حذف این مرحله
          </Button>
        </Paper>
      </Box>
    </Fade>
  );
};

export default NodeEditor;
