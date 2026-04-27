import React, { useState, useCallback, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { CloseRounded, NotesRounded } from "@mui/icons-material";
import StoryGraph from "./components/StoryGraph";
import NodeEditor from "./components/NodeEditor";
import type { StoryNode, Connection } from "./types";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [nodes, setNodes] = useState<StoryNode[]>([
    {
      id: "node-1",
      label: "شروع داستان",
      badge: "Entry",
      description:
        "این نقطه شروع جریان داستان است. از اینجا می‌توانی شاخه‌های مختلف روایت را بسازی و برای هر مرحله توضیح مستقل داشته باشی.",
      color: "#8b5cf6",
      x: 400,
      y: 300,
    },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#6366f1" },
          secondary: { main: "#ec4899" },
          success: { main: "#10b981" },
          background: {
            default: mode === "dark" ? "#050816" : "#eef4ff",
            paper:
              mode === "dark"
                ? "rgba(15, 23, 42, 0.72)"
                : "rgba(255, 255, 255, 0.72)",
          },
        },
        typography: {
          fontFamily: 'Vazir, "Segoe UI", Roboto, sans-serif',
        },
        shape: { borderRadius: 24 },
        direction: "rtl",
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backdropFilter: "blur(24px)",
                border: `1px solid ${
                  mode === "dark"
                    ? "rgba(148, 163, 184, 0.15)"
                    : "rgba(148, 163, 184, 0.28)"
                }`,
                boxShadow:
                  mode === "dark"
                    ? "0 20px 60px rgba(2, 6, 23, 0.42)"
                    : "0 20px 60px rgba(148, 163, 184, 0.22)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                textTransform: "none",
                fontWeight: 700,
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              variant: "outlined",
              size: "small",
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode],
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const detailNode = useMemo(
    () => nodes.find((node) => node.id === detailNodeId) ?? null,
    [nodes, detailNodeId],
  );

  const addNode = useCallback(
    (parentId: string, label: string) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      const newNode: StoryNode = {
        id: `node-${Date.now()}`,
        label: label || `مرحله ${nodes.length + 1}`,
        badge: `Node ${nodes.length + 1}`,
        description: "",
        color: parentNode?.color || "#22c55e",
        x: (parentNode?.x || 400) + 250,
        y: (parentNode?.y || 300) + (Math.random() - 0.5) * 120,
      };
      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [...prev, { from: parentId, to: newNode.id }]);
      setSelectedNodeId(newNode.id);
    },
    [nodes],
  );

  const addConnection = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setConnections((prev) => {
      if (prev.some((c) => c.from === fromId && c.to === toId)) return prev;
      return [...prev, { from: fromId, to: toId }];
    });
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<StoryNode>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    );
  }, []);

  const updateNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
      );
    },
    [],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setConnections((prev) =>
        prev.filter((c) => c.from !== nodeId && c.to !== nodeId),
      );
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      if (detailNodeId === nodeId) setDetailNodeId(null);
    },
    [detailNodeId, selectedNodeId],
  );

  const toggleTheme = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          background:
            mode === "dark"
              ? "radial-gradient(circle at top right, rgba(99, 102, 241, 0.28), transparent 26%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.22), transparent 28%), linear-gradient(180deg, #020617 0%, #0b1120 100%)"
              : "radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 26%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.14), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        }}
      >
        <Navbar
          mode={mode}
          onToggleTheme={toggleTheme}
          nodesCount={nodes.length}
          connectionsCount={connections.length}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(320px, 380px) minmax(0, 1fr)",
            },
            gap: 2.5,
            flex: 1,
            minHeight: 0,
            p: { xs: 1.5, md: 2.5 },
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              overflow: "auto",
              borderRadius: 8,
              bgcolor: "background.paper",
            }}
          >
            <NodeEditor
              selectedNode={selectedNode}
              nodes={nodes}
              onUpdateNode={updateNode}
              onAddChild={(label) =>
                selectedNodeId && addNode(selectedNodeId, label)
              }
              onConnectTo={(targetId) =>
                selectedNodeId && addConnection(selectedNodeId, targetId)
              }
              onDeleteNode={() => selectedNodeId && deleteNode(selectedNodeId)}
              onOpenDescription={(nodeId) => setDetailNodeId(nodeId)}
            />
          </Box>
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              position: "relative",
              bgcolor: "background.paper",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <StoryGraph
              nodes={nodes}
              connections={connections}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdatePosition={updateNodePosition}
              onOpenDescription={(nodeId) => setDetailNodeId(nodeId)}
            />
          </Box>
        </Box>

        <Dialog
          open={Boolean(detailNode)}
          onClose={() => setDetailNodeId(null)}
          fullWidth
          maxWidth="sm"
        >
          {detailNode && (
            <>
              <DialogTitle sx={{ pb: 1.5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: detailNode.color || "primary.main",
                        boxShadow: `0 0 0 6px ${detailNode.color || theme.palette.primary.main}22`,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {detailNode.label}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                        {detailNode.badge ? (
                          <Chip
                            size="small"
                            label={detailNode.badge}
                            color="primary"
                            variant="outlined"
                          />
                        ) : null}
                        <Chip
                          size="small"
                          icon={<NotesRounded />}
                          label="جزئیات مرحله"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <IconButton onClick={() => setDetailNodeId(null)}>
                    <CloseRounded />
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent sx={{ pt: "0 !important", pb: 3 }}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor:
                      mode === "dark"
                        ? "rgba(15, 23, 42, 0.56)"
                        : "rgba(255, 255, 255, 0.64)",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 2,
                      color: "text.primary",
                    }}
                  >
                    {detailNode.description?.trim() ||
                      "برای این مرحله هنوز توضیحی ثبت نشده است."}
                  </Typography>
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App;
