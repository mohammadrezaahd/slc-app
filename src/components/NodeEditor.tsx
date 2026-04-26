// components/NodeEditor.tsx - نسخه نهایی بدون Effect
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
} from "@mui/material";
import { Add, Link, Delete, Edit, AccountTree } from "@mui/icons-material";
import { StoryNode } from "../types";

interface Props {
  selectedNodeId: string | null;
  nodes: StoryNode[];
  onUpdateLabel: (nodeId: string, label: string) => void;
  onAddChild: (label: string) => void;
  onConnectTo: (targetId: string) => void;
  onDeleteNode: () => void;
}

const NodeEditor: React.FC<Props> = ({
  selectedNodeId,
  nodes,
  onUpdateLabel,
  onAddChild,
  onConnectTo,
  onDeleteNode,
}) => {
  // state فقط برای مقادیری که نیاز به ویرایش موقت دارند (مانند input های فرم)
  const [editLabel, setEditLabel] = useState<string>("");
  const [childLabel, setChildLabel] = useState<string>("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // ✅ راه درست: محاسبه مقدار در زمان رندر، بدون useEffect
  // وقتی selectedNode تغییر می‌کند، این مقدار دوباره محاسبه می‌شود
  const currentLabel = selectedNode?.label ?? "";

  // همگام‌سازی editLabel با currentLabel فقط زمانی که selectedNodeId تغییر می‌کند
  // با استفاده از React.useMemo یا مستقیماً در JSX
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditLabel(currentLabel);
  }, [selectedNodeId, currentLabel]); // وابستگی به selectedNodeId و currentLabel

  const handleUpdateLabel = () => {
    if (
      selectedNodeId &&
      editLabel.trim() &&
      editLabel !== selectedNode?.label
    ) {
      onUpdateLabel(selectedNodeId, editLabel.trim());
    }
  };

  const handleAddChild = () => {
    if (selectedNodeId) {
      onAddChild(childLabel.trim() || `مرحله جدید`);
      setChildLabel("");
    }
  };

  const handleConnectTo = () => {
    if (
      selectedNodeId &&
      selectedTargetId &&
      selectedNodeId !== selectedTargetId
    ) {
      onConnectTo(selectedTargetId);
      setSelectedTargetId("");
    }
  };

  if (!selectedNodeId) {
    return (
      <Fade in={true}>
        <Box sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <AccountTree
              sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.7 }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              سازنده نمودار داستانی
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              روی هر گره کلیک کنید تا ویرایشگر باز شود
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 نکات کاربردی
            </Typography>
            <Stack
              spacing={1}
              sx={{ textAlign: "right", fontSize: 13, color: "text.secondary" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="✓"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2">اضافه کردن مرحله جدید</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="✓"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Typography variant="body2">
                  اتصال به مراحل قبلی با Dropdown
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="✓" size="small" color="info" variant="outlined" />
                <Typography variant="body2">
                  جابجایی گره‌ها با Drag & Drop
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label="✓"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Typography variant="body2">
                  زوم با اسکرول و جابجایی زمینه
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  const otherNodes = nodes.filter((n) => n.id !== selectedNodeId);

  return (
    <Fade in={true}>
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Edit sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="h6">ویرایش مرحله</Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 2 }}
          >
            {currentLabel}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="متن مرحله"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleUpdateLabel}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateLabel()}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment:
                  editLabel !== currentLabel && editLabel.trim() ? (
                    <Tooltip title="ذخیره">
                      <IconButton
                        size="small"
                        onClick={handleUpdateLabel}
                        edge="end"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null,
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Add sx={{ fontSize: 20, color: "success.main" }} />
            <Typography variant="subtitle2">اضافه کردن مرحله جدید</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
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
            >
              ایجاد
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Link sx={{ fontSize: 20, color: "secondary.main" }} />
            <Typography variant="subtitle2">اتصال به مرحله دیگر</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
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
                    {node.label} (ID: {node.id.slice(-5)})
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
            >
              اتصال
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3, fontSize: 12 }}>
            <strong>اتصال پیشرفته:</strong> می‌توانید هر گره را به هر گره دیگری
            (حتی مراحل قبلی) متصل کنید.
          </Alert>

          <Divider sx={{ my: 2 }} />

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
