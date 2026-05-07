import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  CloseRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  NotesRounded,
  TuneRounded,
  DownloadRounded,
  PictureAsPdfRounded,
} from "@mui/icons-material";
import StoryGraph, { type StoryGraphHandle } from "./components/StoryGraph";
import NodeEditor from "./components/NodeEditor";
import type { StoryNode, Connection } from "./types";
import Navbar from "./components/Navbar";

type CanvasSnapshot = {
  version: number;
  exportedAt: string;
  nodes: StoryNode[];
  connections: Connection[];
};

const isValidStoryNode = (value: unknown): value is StoryNode => {
  if (!value || typeof value !== "object") return false;
  const node = value as Record<string, unknown>;
  return (
    typeof node.id === "string" &&
    typeof node.label === "string" &&
    typeof node.x === "number" &&
    typeof node.y === "number"
  );
};

const isValidConnection = (value: unknown): value is Connection => {
  if (!value || typeof value !== "object") return false;
  const connection = value as Record<string, unknown>;
  return (
    typeof connection.from === "string" && typeof connection.to === "string"
  );
};

const App: React.FC = () => {
  const mobileEditorCloseGuardUntilRef = useRef<number>(0);
  const graphRef = useRef<StoryGraphHandle>(null);
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [nodes, setNodes] = useState<StoryNode[]>([
    {
      id: "node-1",
      label: "Story Start",
      badge: "Entry",
      description:
        "This is the start of your story flow. From here, you can branch your narrative and keep a dedicated description for each step.",
      color: "#8b5cf6",
      x: 400,
      y: 300,
    },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState("story-flow-canvas");

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
          fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif',
        },
        shape: { borderRadius: 24 },
        direction: "ltr",
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

  const createNodeId = useCallback(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `node-${crypto.randomUUID()}`;
    }

    return `node-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const addChildren = useCallback(
    (parentId: string, labels: string[]) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      const cleanLabels = labels.map((label) => label.trim()).filter(Boolean);
      const finalLabels = cleanLabels.length ? cleanLabels : ["New step"];
      const startIndex = nodes.length + 1;

      const newNodes: StoryNode[] = finalLabels.map((label, index) => {
        const offsetIndex = index - (finalLabels.length - 1) / 2;

        return {
          id: createNodeId(),
          label: label || `Step ${startIndex + index}`,
          badge: `Node ${startIndex + index}`,
          description: "",
          color: parentNode?.color || "#22c55e",
          x: (parentNode?.x || 400) + 250,
          y: (parentNode?.y || 300) + offsetIndex * 120,
        };
      });

      setNodes((prev) => [...prev, ...newNodes]);
      setConnections((prev) => [
        ...prev,
        ...newNodes.map((node) => ({ from: parentId, to: node.id })),
      ]);
      setSelectedNodeId(newNodes[newNodes.length - 1].id);
    },
    [createNodeId, nodes],
  );

  const addConnection = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setConnections((prev) => {
      if (prev.some((c) => c.from === fromId && c.to === toId)) return prev;
      return [...prev, { from: fromId, to: toId }];
    });
  }, []);

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<StoryNode>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
      );
    },
    [],
  );

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

  // Auto-fit view on first render
  useEffect(() => {
    const timer = setTimeout(() => graphRef.current?.fitToView(), 320);
    return () => clearTimeout(timer);
  }, []);

  const openMobileEditor = useCallback(() => {
    mobileEditorCloseGuardUntilRef.current = Date.now() + 280;
    setIsMobileEditorOpen(true);
  }, []);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleNodeTap = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (typeof window !== "undefined" && window.innerWidth < 1200) {
      openMobileEditor();
    }
  }, [openMobileEditor]);

  const handleExportCanvas = useCallback(() => {
    setExportFileName("story-flow-canvas");
    setExportModalOpen(true);
  }, []);

  const handleDownloadJSON = useCallback((filename: string) => {
    const snapshot: CanvasSnapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      nodes,
      connections,
    };
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename || "story-flow-canvas"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  }, [connections, nodes]);

  const handleExportPDF = useCallback((filename: string) => {
    graphRef.current?.exportAsPdf(filename || "story-flow-canvas");
    setExportModalOpen(false);
  }, []);

  const handleImportCanvas = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<CanvasSnapshot>;

      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections)) {
        throw new Error("Invalid canvas file format.");
      }

      const importedNodes = parsed.nodes.filter(isValidStoryNode);
      const importedConnections = parsed.connections.filter(isValidConnection);

      if (importedNodes.length !== parsed.nodes.length) {
        throw new Error("Some imported nodes are invalid.");
      }

      if (importedConnections.length !== parsed.connections.length) {
        throw new Error("Some imported connections are invalid.");
      }

      const nodeIds = new Set(importedNodes.map((node) => node.id));
      const normalizedConnections = importedConnections.filter(
        (connection) =>
          nodeIds.has(connection.from) && nodeIds.has(connection.to),
      );

      setNodes(importedNodes);
      setConnections(normalizedConnections);
      setSelectedNodeId(null);
      setDetailNodeId(null);
      // Re-center canvas after import
      setTimeout(() => graphRef.current?.fitToView(), 120);
    } catch (error) {
      console.error("Import failed:", error);
      window.alert("The selected file is not a valid canvas export.");
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          minHeight: "100vh",
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
          onExportCanvas={handleExportCanvas}
          onImportCanvas={handleImportCanvas}
          onOpenNodeSettings={openMobileEditor}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: isEditorCollapsed
                ? "72px minmax(0, 1fr)"
                : "minmax(330px, 390px) minmax(0, 1fr)",
            },
            gridTemplateRows: {
              xs: "minmax(0, 1fr)",
              lg: "1fr",
            },
            transition:
              "grid-template-columns 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            gap: { xs: 0, md: 2.5 },
            flex: 1,
            minHeight: 0,
            p: { xs: 0, md: 2.5 },
          }}
        >
          <Box
            sx={{
              display: { xs: "none", lg: "block" },
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              borderRadius: { xs: "14px", md: "18px" },
              bgcolor: "background.paper",
              transition: "all 0.24s ease",
              position: "relative",
              /* on mobile cap height so canvas still shows */
              maxHeight: { xs: "42vh", lg: "unset" },
            }}
          >
            {/* collapse toggle — desktop only */}
            <Tooltip
              title={isEditorCollapsed ? "Expand editor" : "Collapse editor"}
            >
              <IconButton
                size="small"
                onClick={() => setIsEditorCollapsed((prev) => !prev)}
                aria-label={
                  isEditorCollapsed
                    ? "Expand node editor"
                    : "Collapse node editor"
                }
                sx={{
                  display: { xs: "none", lg: "inline-flex" },
                  position: "absolute",
                  top: 14,
                  right: 12,
                  zIndex: 4,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {isEditorCollapsed ? (
                  <ChevronRightRounded fontSize="small" />
                ) : (
                  <ChevronLeftRounded fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                overflowX: "hidden",
                direction: "rtl",
                "& > *": { direction: "ltr" },
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(148, 163, 184, 0.35)",
                  borderRadius: 8,
                  border: "2px solid transparent",
                  backgroundClip: "padding-box",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(99, 102, 241, 0.55)",
                  backgroundClip: "padding-box",
                },
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(148, 163, 184, 0.35) transparent",
                /* on mobile always visible; desktop follows collapsed state */
                opacity: { xs: 1, lg: isEditorCollapsed ? 0 : 1 },
                transform: {
                  xs: "none",
                  lg: isEditorCollapsed ? "translateX(-14px)" : "translateX(0)",
                },
                transition: "opacity 220ms ease, transform 260ms ease",
                pointerEvents: {
                  xs: "auto",
                  lg: isEditorCollapsed ? "none" : "auto",
                },
                pt: { xs: 1, lg: 4.5 },
              }}
            >
              <Box>
                <NodeEditor
                  selectedNode={selectedNode}
                  nodes={nodes}
                  onUpdateNode={updateNode}
                  onAddChildren={(labels) =>
                    selectedNodeId && addChildren(selectedNodeId, labels)
                  }
                  onConnectTo={(targetId) =>
                    selectedNodeId && addConnection(selectedNodeId, targetId)
                  }
                  onDeleteNode={() =>
                    selectedNodeId && deleteNode(selectedNodeId)
                  }
                  onOpenDescription={(nodeId) => setDetailNodeId(nodeId)}
                />
              </Box>
            </Box>

            <Stack
              spacing={1}
              sx={{
                display: { xs: "none", lg: "flex" },
                px: 0.75,
                py: 2,
                color: "text.secondary",
                height: "100%",
                opacity: isEditorCollapsed ? 1 : 0,
                transform: isEditorCollapsed
                  ? "translateX(0)"
                  : "translateX(-10px)",
                transition: "opacity 220ms ease, transform 260ms ease",
                pointerEvents: isEditorCollapsed ? "auto" : "none",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <TuneRounded color="primary" />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                Edit
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              height: "100%",
              position: "relative",
              bgcolor: "background.paper",
              borderRadius: { xs: 0, md: "18px" },
              overflow: "hidden",
            }}
          >
            <StoryGraph
              ref={graphRef}
              nodes={nodes}
              connections={connections}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onNodeTap={handleNodeTap}
              onUpdatePosition={updateNodePosition}
              onOpenDescription={(nodeId) => setDetailNodeId(nodeId)}
            />
          </Box>
        </Box>

        <Dialog
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Export Canvas
              </Typography>
              <IconButton size="small" onClick={() => setExportModalOpen(false)}>
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: "8px !important" }}>
            <TextField
              fullWidth
              label="File name"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDownloadJSON(exportFileName)}
              autoFocus
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfRounded />}
              onClick={() => handleExportPDF(exportFileName)}
              sx={{ flex: 1 }}
            >
              Save as PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadRounded />}
              onClick={() => handleDownloadJSON(exportFileName)}
              sx={{ flex: 1 }}
            >
              Export JSON
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer
          anchor="bottom"
          open={isMobileEditorOpen}
          onClose={(_, reason) => {
            if (
              reason === "backdropClick" &&
              Date.now() < mobileEditorCloseGuardUntilRef.current
            ) {
              return;
            }
            setIsMobileEditorOpen(false);
          }}
          sx={{ display: { xs: "block", lg: "none" } }}
          slotProps={{
            paper: {
              sx: {
                height: { xs: "56dvh", sm: "58dvh" },
                maxHeight: { xs: "56dvh", sm: "58dvh" },
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                backgroundImage: "none",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              pt: 1,
              pb: 0.25,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 4,
                borderRadius: 99,
                bgcolor: "text.disabled",
              }}
            />
          </Box>
          <DialogTitle sx={{ pb: 1.25, pt: 0.5, flexShrink: 0 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <TuneRounded color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Node settings
                </Typography>
              </Stack>
              <IconButton
                aria-label="Close node settings"
                onClick={() => setIsMobileEditorOpen(false)}
              >
                <CloseRounded />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent
            sx={{ pt: "0 !important", px: 0, pb: 1, flex: 1, overflowY: "auto" }}
          >
            <NodeEditor
              selectedNode={selectedNode}
              nodes={nodes}
              onUpdateNode={updateNode}
              onAddChildren={(labels) =>
                selectedNodeId && addChildren(selectedNodeId, labels)
              }
              onConnectTo={(targetId) => selectedNodeId && addConnection(selectedNodeId, targetId)}
              onDeleteNode={() => selectedNodeId && deleteNode(selectedNodeId)}
              onOpenDescription={(nodeId) => {
                setDetailNodeId(nodeId);
                setIsMobileEditorOpen(false);
              }}
            />
          </DialogContent>
        </Drawer>

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
                  spacing={2}
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center" }}
                  >
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
                          label="Step details"
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
                      "No description has been saved for this step yet."}
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
