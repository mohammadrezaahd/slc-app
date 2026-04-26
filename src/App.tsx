// App.tsx (اصلاح شده - بدون LocalizationProvider)
import React, { useState, useCallback, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import StoryGraph from "./components/StoryGraph";
import NodeEditor from "./components/NodeEditor";
import type { StoryNode, Connection } from "./types";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [nodes, setNodes] = useState<StoryNode[]>([
    { id: "node-1", label: "شروع داستان", x: 400, y: 300 },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#6366f1" },
          secondary: { main: "#ec4899" },
          background: {
            default: mode === "dark" ? "#0f172a" : "#f8fafc",
            paper: mode === "dark" ? "#1e293b" : "#ffffff",
          },
        },
        typography: {
          fontFamily: 'Vazir, "Segoe UI", Roboto, sans-serif',
        },
        shape: { borderRadius: 12 },
        direction: "rtl",
      }),
    [mode],
  );

  const addNode = useCallback(
    (parentId: string, label: string) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      const newNode: StoryNode = {
        id: `node-${Date.now()}`,
        label: label || `مرحله ${nodes.length + 1}`,
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

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, label: newLabel } : n)),
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
    },
    [selectedNodeId],
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
        }}
      >
        <Navbar mode={mode} onToggleTheme={toggleTheme} />
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Box
            sx={{
              width: 360,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              overflow: "auto",
            }}
          >
            <NodeEditor
              selectedNodeId={selectedNodeId}
              nodes={nodes}
              onUpdateLabel={updateNodeLabel}
              onAddChild={(label) =>
                selectedNodeId && addNode(selectedNodeId, label)
              }
              onConnectTo={(targetId) =>
                selectedNodeId && addConnection(selectedNodeId, targetId)
              }
              onDeleteNode={() => selectedNodeId && deleteNode(selectedNodeId)}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              position: "relative",
              bgcolor: "background.default",
            }}
          >
            <StoryGraph
              nodes={nodes}
              connections={connections}
              onSelectNode={setSelectedNodeId}
              onUpdatePosition={updateNodePosition}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
