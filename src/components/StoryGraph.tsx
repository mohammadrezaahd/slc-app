// components/StoryGraph.tsx - نسخه کاملاً type-safe
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { StoryNode, Connection } from "../types";
import { Box, useTheme } from "@mui/material";

interface Props {
  nodes: StoryNode[];
  connections: Connection[];
  onSelectNode: (nodeId: string) => void;
  onUpdatePosition: (nodeId: string, x: number, y: number) => void;
}

// تایپ برای داده‌های D3
type D3ZoomEvent = d3.D3ZoomEvent<SVGSVGElement, unknown>;
type D3DragEvent = d3.D3DragEvent<SVGGElement, StoryNode, unknown>;

const StoryGraph: React.FC<Props> = ({
  nodes,
  connections,
  onSelectNode,
  onUpdatePosition,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append<SVGGElement>("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on("zoom", (event: D3ZoomEvent) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Initial center
    const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2);
    svg.call(zoom.transform, initialTransform);
    g.attr("transform", initialTransform.toString());

    // Defs for markers and filters
    const defs = g.append("defs");

    // Arrowhead marker
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 12)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", theme.palette.primary.main);

    // Shadow filter
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

    // Helper function to update lines
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
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M ${source.x} ${source.y} C ${source.x + dr * 0.3} ${source.y}, ${target.x - dr * 0.3} ${target.y}, ${target.x} ${target.y}`;
        },
      );
    };

    // Helper function to update nodes
    const updateNodes = () => {
      const nodeGroups = g
        .selectAll<SVGGElement, StoryNode>(".node")
        .data(nodes, (d: StoryNode) => d.id);

      const drag = d3
        .drag<SVGGElement, StoryNode>()
        .on("drag", (event: D3DragEvent, d: StoryNode) => {
          const newX = event.x;
          const newY = event.y;
          d3.select(event.sourceEvent?.target as SVGGElement).attr(
            "transform",
            `translate(${newX}, ${newY})`,
          );
          onUpdatePosition(d.id, newX, newY);
          updateLines();
        });

      nodeGroups.join(
        (enter) => {
          const group = enter
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: StoryNode) => `translate(${d.x}, ${d.y})`)
            .attr("cursor", "pointer")
            .on("click", (event: MouseEvent, d: StoryNode) => {
              event.stopPropagation();
              onSelectNode(d.id);
            })
            .call(drag);

          // Circle background
          group
            .append("circle")
            .attr("r", 42)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 3)
            .attr("filter", "url(#shadow)")
            .style("transition", "all 0.2s ease");

          // Text using foreignObject
          group
            .append("foreignObject")
            .attr("width", 84)
            .attr("height", 60)
            .attr("x", -42)
            .attr("y", -30)
            .html(
              (d: StoryNode) => `
              <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-family: Vazir, sans-serif;
                font-size: 11px;
                font-weight: 500;
                color: ${theme.palette.text.primary};
                direction: rtl;
                word-wrap: break-word;
                padding: 4px;
                line-height: 1.3;
              ">
                ${d.label.length > 18 ? d.label.slice(0, 15) + "..." : d.label}
              </div>
            `,
            );

          // Hover effects
          group
            .on("mouseenter", function (this: SVGGElement) {
              d3.select(this)
                .select("circle")
                .attr("stroke", theme.palette.secondary.main)
                .attr("stroke-width", 4);
            })
            .on("mouseleave", function (this: SVGGElement) {
              d3.select(this)
                .select("circle")
                .attr("stroke", theme.palette.primary.main)
                .attr("stroke-width", 3);
            });

          return group;
        },
        (update) => {
          update.attr(
            "transform",
            (d: StoryNode) => `translate(${d.x}, ${d.y})`,
          );
          update.select("foreignObject").html(
            (d: StoryNode) => `
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-family: Vazir, sans-serif;
              font-size: 11px;
              font-weight: 500;
              color: ${theme.palette.text.primary};
              direction: rtl;
              word-wrap: break-word;
              padding: 4px;
              line-height: 1.3;
            ">
              ${d.label.length > 18 ? d.label.slice(0, 15) + "..." : d.label}
            </div>
          `,
          );
          return update;
        },
        (exit) => exit.remove(),
      );

      updateLines();
    };

    updateNodes();

    // Cleanup
    return () => {
      svg.selectAll("*").remove();
    };
  }, [nodes, connections, onSelectNode, onUpdatePosition, theme]);

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", height: "100%", bgcolor: "background.default" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      />
    </Box>
  );
};

export default StoryGraph;
