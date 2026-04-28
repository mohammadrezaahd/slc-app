import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import type { StoryNode, Connection } from "../types";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AddRounded,
  CenterFocusStrongRounded,
  RemoveRounded,
  RestartAltRounded,
} from "@mui/icons-material";

interface Props {
  nodes: StoryNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onNodeTap: (nodeId: string) => void;
  onUpdatePosition: (nodeId: string, x: number, y: number) => void;
  onOpenDescription: (nodeId: string) => void;
}

type D3ZoomEvent = d3.D3ZoomEvent<SVGSVGElement, unknown>;
type D3DragEvent = d3.D3DragEvent<SVGGElement, StoryNode, unknown>;

const nodeWidth = 196;
const nodeHeight = 112;
const workspaceLimit = 12000;

const splitLabel = (value: string, maxChars = 16, maxLines = 2) => {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return ["Untitled step"];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (words.join(" ").length > lines.join(" ").length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, maxChars - 1)}…`;
  }

  return lines.slice(0, maxLines);
};

const getPreview = (value?: string) => {
  if (!value?.trim()) return "No description saved";
  return value.length > 44 ? `${value.slice(0, 44)}…` : value;
};

const getRectIntersection = (
  source: Pick<StoryNode, "x" | "y">,
  target: Pick<StoryNode, "x" | "y">,
  padding = 0,
) => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const halfWidth = Math.max(8, nodeWidth / 2 - padding);
  const halfHeight = Math.max(8, nodeHeight / 2 - padding);
  const scale = Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight);

  if (!Number.isFinite(scale) || scale === 0) {
    return { x: source.x, y: source.y };
  }

  return {
    x: source.x + dx / scale,
    y: source.y + dy / scale,
  };
};

const StoryGraph: React.FC<Props> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onNodeTap,
  onUpdatePosition,
  onOpenDescription,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<Record<string, { x: number; y: number; time: number }>>({});
  const didMoveRef = useRef<Record<string, boolean>>({});
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null,
  );
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(
    null,
  );
  const initializedRef = useRef(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const theme = useTheme();

  const zoomBy = useCallback((factor: number) => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current) return;

    svgSelectionRef.current
      .transition()
      .duration(180)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  }, []);

  const resetView = useCallback(() => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current || !containerRef.current) {
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1);

    svgSelectionRef.current
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  const fitToView = useCallback(() => {
    if (
      !svgSelectionRef.current ||
      !zoomBehaviorRef.current ||
      !containerRef.current ||
      nodes.length === 0
    ) {
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const padding = 180;
    const minX = Math.min(...nodes.map((node) => node.x - nodeWidth / 2)) - padding;
    const maxX = Math.max(...nodes.map((node) => node.x + nodeWidth / 2)) + padding;
    const minY = Math.min(...nodes.map((node) => node.y - nodeHeight / 2)) - padding;
    const maxY = Math.max(...nodes.map((node) => node.y + nodeHeight / 2)) + padding;
    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);
    const scale = Math.max(
      0.05,
      Math.min(2.2, Math.min(width / contentWidth, height / contentHeight)),
    );
    const translateX = width / 2 - scale * (minX + contentWidth / 2);
    const translateY = height / 2 - scale * (minY + contentHeight / 2);
    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    svgSelectionRef.current
      .transition()
      .duration(260)
      .call(zoomBehaviorRef.current.transform, transform);
  }, [nodes]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll("*").remove();
    svgSelectionRef.current = svg;

    const g = svg.append<SVGGElement>("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [width, height],
      ])
      .translateExtent([
        [-workspaceLimit, -workspaceLimit],
        [workspaceLimit, workspaceLimit],
      ])
      .scaleExtent([0.05, 4])
      .on("zoom", (event: D3ZoomEvent) => {
        zoomTransformRef.current = event.transform;
        setZoomPercent(Math.round(event.transform.k * 100));
        g.attr("transform", event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;

    svg.call(zoom);

    if (!initializedRef.current) {
      const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2);
      zoomTransformRef.current = initialTransform;
      initializedRef.current = true;
    }
    svg.call(zoom.transform, zoomTransformRef.current);

    const defs = g.append("defs");

    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", theme.palette.primary.main);

    defs
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-30%")
      .attr("y", "-30%")
      .attr("width", "160%")
      .attr("height", "160%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 4)
      .attr("stdDeviation", 6)
      .attr("floodOpacity", 0.3);

    defs
      .append("filter")
      .attr("id", "selectedGlow")
      .attr("x", "-40%")
      .attr("y", "-40%")
      .attr("width", "180%")
      .attr("height", "180%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 8)
      .attr("floodColor", theme.palette.secondary.main)
      .attr("floodOpacity", 0.35);

    const updateLines = () => {
      const lines = g
        .selectAll<SVGPathElement, Connection>(".connection")
        .data(connections, (d: Connection) => `${d.from}-${d.to}`);

      lines.join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "connection")
            .attr("fill", "none")
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "6,4")
            .attr("marker-end", "url(#arrowhead)")
            .style("pointer-events", "none")
            .attr("opacity", 0.8),
        (update) => update,
        (exit) => exit.remove(),
      );

      // Update line paths
      g.selectAll<SVGPathElement, Connection>(".connection").attr(
        "d",
        (d: Connection) => {
          const source = nodes.find((n: StoryNode) => n.id === d.from);
          const target = nodes.find((n: StoryNode) => n.id === d.to);
          if (!source || !target) return "";

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 0.001) return "";

          const start = getRectIntersection(source, target, 0);
          const end = getRectIntersection(target, source, 0);

          const startX = start.x;
          const startY = start.y;
          const endX = end.x;
          const endY = end.y;

          const pathDx = endX - startX;
          const pathDy = endY - startY;
          const ux = dx / distance;
          const uy = dy / distance;
          const normalX = -uy;
          const normalY = ux;
          const curve = Math.min(36, distance * 0.12);
          const c1X = startX + pathDx * 0.33 + normalX * curve;
          const c1Y = startY + pathDy * 0.33 + normalY * curve;
          const c2X = startX + pathDx * 0.66 + normalX * curve;
          const c2Y = startY + pathDy * 0.66 + normalY * curve;

          return `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
        },
      );
    };

    const updateNodes = () => {
      const nodeGroups = g
        .selectAll<SVGGElement, StoryNode>(".node")
        .data(nodes, (d: StoryNode) => d.id);

      const drag = d3
        .drag<SVGGElement, StoryNode>()
        .clickDistance(6)
        .on("start", (_event: D3DragEvent, d: StoryNode) => {
          dragStartRef.current[d.id] = { x: d.x, y: d.y, time: Date.now() };
          didMoveRef.current[d.id] = false;
          onSelectNode(d.id);
        })
        .on("drag", function (event: D3DragEvent, d: StoryNode) {
          const newX = event.x;
          const newY = event.y;

          const start = dragStartRef.current[d.id];
          if (start) {
            const movedDistance = Math.hypot(newX - start.x, newY - start.y);
            if (movedDistance > 8) {
              didMoveRef.current[d.id] = true;
            }
          }

          d.x = newX;
          d.y = newY;
          d3.select(this).attr("transform", `translate(${newX}, ${newY})`);
          updateLines();
        })
        .on("end", (_event: D3DragEvent, d: StoryNode) => {
          onUpdatePosition(d.id, d.x, d.y);

          const start = dragStartRef.current[d.id];
          const didMove = didMoveRef.current[d.id];
          const isQuickTap = start ? Date.now() - start.time < 280 : false;

          if (!didMove && isQuickTap) {
            onNodeTap(d.id);
          }

          delete dragStartRef.current[d.id];
          delete didMoveRef.current[d.id];
        });

      nodeGroups.join(
        (enter) => {
          const group = enter
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: StoryNode) => `translate(${d.x}, ${d.y})`)
            .attr("cursor", "pointer")
            .on("pointerdown", (event: PointerEvent, d: StoryNode) => {
              event.stopPropagation();
              onSelectNode(d.id);
            })
            .on("touchstart", (event: TouchEvent, d: StoryNode) => {
              event.stopPropagation();
              onSelectNode(d.id);
            })
            .on("mousedown", (event: MouseEvent, d: StoryNode) => {
              event.stopPropagation();
              onSelectNode(d.id);
            })
            .on("click", (event: MouseEvent, d: StoryNode) => {
              event.stopPropagation();
              onSelectNode(d.id);
            })
            .call(drag);

          group
            .append("rect")
            .attr("class", "node-surface")
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 28)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.primary.main)
            .attr("filter", "url(#shadow)")
            .style("transition", "all 0.2s ease");

          group
            .append("rect")
            .attr("class", "badge-surface")
            .attr("x", 18)
            .attr("y", -48)
            .attr("width", 68)
            .attr("height", 22)
            .attr("rx", 11)
            .attr("opacity", 0);

          group
            .append("text")
            .attr("class", "badge-text")
            .attr("x", 52)
            .attr("y", -33)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("font-weight", 700)
            .attr("opacity", 0)
            .attr("fill", theme.palette.common.white);

          group
            .append("text")
            .attr("class", "node-title-line-1")
            .attr("x", 0)
            .attr("y", -4)
            .attr("text-anchor", "middle")
            .attr("font-size", 15)
            .attr("font-weight", 800)
            .attr("fill", theme.palette.text.primary);

          group
            .append("text")
            .attr("class", "node-title-line-2")
            .attr("x", 0)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", 15)
            .attr("font-weight", 800)
            .attr("fill", theme.palette.text.primary);

          group
            .append("text")
            .attr("class", "node-description")
            .attr("x", 0)
            .attr("y", 42)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", theme.palette.text.secondary);

          const infoButton = group
            .append("g")
            .attr("class", "info-button")
            .attr("transform", `translate(${-nodeWidth / 2 + 24}, ${-nodeHeight / 2 + 24})`)
            .style("cursor", "pointer")
            .on("pointerdown", (event: PointerEvent, d: StoryNode) => {
              event.stopPropagation();
              onOpenDescription(d.id);
            })
            .on("touchstart", (event: TouchEvent, d: StoryNode) => {
              event.stopPropagation();
              onOpenDescription(d.id);
            })
            .on("click", (event: MouseEvent, d: StoryNode) => {
              event.stopPropagation();
              onOpenDescription(d.id);
            });

          infoButton
            .append("circle")
            .attr("r", 14)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.divider)
            .attr("stroke-width", 1.5);

          infoButton
            .append("text")
            .attr("y", 4)
            .attr("text-anchor", "middle")
            .attr("font-size", 14)
            .attr("font-weight", 900)
            .attr("fill", theme.palette.text.primary)
            .text("i");

          group
            .on("mouseenter", function (this: SVGGElement) {
              d3.select(this)
                .select<SVGRectElement>(".node-surface")
                .attr("stroke", theme.palette.secondary.main)
                .attr("stroke-width", 4);
            })
            .on("mouseleave", function (this: SVGGElement) {
              d3.select(this)
                .select<SVGRectElement>(".node-surface")
                .attr("stroke-width", 2.5);
            });

          return group;
        },
        (update) => {
          update.attr(
            "transform",
            (d: StoryNode) => `translate(${d.x}, ${d.y})`,
          );
          return update;
        },
        (exit) => exit.remove(),
      );

      g.selectAll<SVGGElement, StoryNode>(".node").each(function (d: StoryNode) {
        const group = d3.select(this);
        const accentColor = d.color || theme.palette.primary.main;
        const titleLines = splitLabel(d.label);
        const isSelected = d.id === selectedNodeId;

        group
          .select<SVGRectElement>(".node-surface")
          .attr(
            "fill",
            d3.color(accentColor)?.copy({
              opacity: theme.palette.mode === "dark" ? 0.16 : 0.1,
            })?.formatRgb() || theme.palette.background.paper,
          )
          .attr("stroke", accentColor)
          .attr("stroke-width", isSelected ? 3.5 : 2.5)
          .attr("filter", isSelected ? "url(#selectedGlow)" : "url(#shadow)");

        group
          .select<SVGRectElement>(".badge-surface")
          .attr(
            "fill",
            d3.color(accentColor)?.copy({ opacity: 0.9 })?.formatRgb() || accentColor,
          )
          .attr("opacity", d.badge?.trim() ? 1 : 0);

        group
          .select<SVGTextElement>(".badge-text")
          .text(d.badge || "")
          .attr("opacity", d.badge?.trim() ? 1 : 0);

        group.select<SVGTextElement>(".node-title-line-1").text(titleLines[0] || "");
        group.select<SVGTextElement>(".node-title-line-2").text(titleLines[1] || "");
        group
          .select<SVGTextElement>(".node-description")
          .text(getPreview(d.description));

        group
          .select<SVGGElement>(".info-button")
          .attr("display", d.description?.trim() ? null : "none");
      });

      updateLines();
    };

    updateNodes();

    // Cleanup
    return () => {
      svg.selectAll("*").remove();
    };
  }, [
    nodes,
    connections,
    selectedNodeId,
    onSelectNode,
    onNodeTap,
    onUpdatePosition,
    onOpenDescription,
    theme,
  ]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 24%), linear-gradient(180deg, rgba(15, 23, 42, 0.58), rgba(2, 6, 23, 0.86))"
            : "radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 24%), linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(238, 244, 255, 0.96))",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 3,
          p: 1.25,
          borderRadius: "12px",
          width: 220,
          maxWidth: "calc(100% - 32px)",
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(15, 23, 42, 0.78)"
              : "rgba(255, 255, 255, 0.82)",
        }}
      >
        <Stack spacing={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              Zoom Canvas
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {zoomPercent}%
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75}>
            <Tooltip title="Zoom out">
              <IconButton size="small" onClick={() => zoomBy(0.8)}>
                <RemoveRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom in">
              <IconButton size="small" onClick={() => zoomBy(1.25)}>
                <AddRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fit to content">
              <IconButton size="small" onClick={fitToView}>
                <CenterFocusStrongRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset view">
              <IconButton size="small" onClick={resetView}>
                <RestartAltRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5,
              display: "block",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            }}
          >
            Use scroll or these controls to zoom and navigate large storylines.
          </Typography>
        </Stack>
      </Paper>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: "block", position: "relative", zIndex: 1 }}
      />
    </Box>
  );
};

export default StoryGraph;
