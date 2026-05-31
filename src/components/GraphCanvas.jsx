import React, { useState, useRef, useEffect } from "react";
import { pathColors } from "../algorithms/dijkstra";

export default function GraphCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  currentStep,
  isRunning,
  top5Paths,
  selectedPathIndex,
  onPathClick,
  newNodeId,
}) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pendingWeight, setPendingWeight] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [newEdgeIndex, setNewEdgeIndex] = useState(null);
  const [pathTooltip, setPathTooltip] = useState(null);
  const [rippleNode, setRippleNode] = useState(null);

  // Trigger ripple on destination reached
  useEffect(() => {
    if (currentStep?.type === "DESTINATION_REACHED") {
      setRippleNode(currentStep.currentNode);
      setTimeout(() => setRippleNode(null), 1000);
    }
  }, [currentStep]);

  const getNextNodeId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[nodes.length] || `N${nodes.length}`;
  };

  const handleCanvasClick = (e) => {
    if (isRunning) return;
    if (e.target !== svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode = { id: getNextNodeId(), x, y, isNew: true };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(null);

    // Remove isNew after bounce
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === newNode.id ? { ...n, isNew: false } : n))
      );
    }, 500);
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    if (isRunning) return;

    if (selectedNode === null) {
      setSelectedNode(nodeId);
    } else if (selectedNode === nodeId) {
      setSelectedNode(null);
    } else {
      const alreadyExists = edges.some(
        (edge) =>
          (edge.source === selectedNode && edge.target === nodeId) ||
          (edge.source === nodeId && edge.target === selectedNode)
      );

      if (!alreadyExists) {
        setPendingWeight({ source: selectedNode, target: nodeId });
        setWeightInput("");
      }
      setSelectedNode(null);
    }
  };

  const handleWeightConfirm = () => {
    const w = parseInt(weightInput);
    if (isNaN(w) || w <= 0) return;

    const newEdge = {
      source: pendingWeight.source,
      target: pendingWeight.target,
      weight: w,
      isNew: true,
    };

    setEdges((prev) => {
      const updated = [...prev, newEdge];
      setNewEdgeIndex(updated.length - 1);
      return updated;
    });

    // Remove isNew after draw animation
    setTimeout(() => {
      setEdges((prev) =>
        prev.map((e, i) =>
          i === edges.length ? { ...e, isNew: false } : e
        )
      );
      setNewEdgeIndex(null);
    }, 700);

    setPendingWeight(null);
    setWeightInput("");
  };

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (isRunning) return;

    const rect = svgRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNode ? { ...n, x, y } : n))
    );
  };

  const handleMouseUp = () => setDraggingNode(null);

  // Touch support for mobile
  const handleTouchStart = (e, nodeId) => {
    e.stopPropagation();
    if (isRunning) return;
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    setDraggingNode(nodeId);
    setDragOffset({
      x: touch.clientX - rect.left - node.x,
      y: touch.clientY - rect.top - node.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!draggingNode) return;
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - dragOffset.x;
    const y = touch.clientY - rect.top - dragOffset.y;
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNode ? { ...n, x, y } : n))
    );
  };

  // ---- Color logic ----

  const getNodeColor = (nodeId) => {
    if (!currentStep) return "#3b82f6";
    const { currentNode, visited, path, type } = currentStep;
    if (type === "FINAL" && path && path.includes(nodeId)) return "#f97316";
    if (type === "DESTINATION_REACHED" && nodeId === currentNode) return "#06b6d4";
    if (nodeId === currentNode) return "#eab308";
    if (visited && visited.has(nodeId)) return "#22c55e";
    return "#3b82f6";
  };

  const isOnFinalPath = (nodeId) => {
    if (!currentStep) return false;
    const { type, path } = currentStep;
    return type === "FINAL" && path && path.includes(nodeId);
  };

  const getEdgeColor = (edge) => {
    if (!currentStep) return "#4b5563";
    const { highlightEdge, path, type } = currentStep;

    if (type === "FINAL" && path && path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]; const b = path[i + 1];
        if (
          (edge.source === a && edge.target === b) ||
          (edge.source === b && edge.target === a)
        ) return "#f97316";
      }
    }

    if (
      highlightEdge &&
      ((edge.source === highlightEdge.source && edge.target === highlightEdge.target) ||
        (edge.source === highlightEdge.target && edge.target === highlightEdge.source))
    ) return "#a855f7";

    return "#4b5563";
  };

  const isShortestPathEdge = (edge) => {
    if (!currentStep) return false;
    const { type, path } = currentStep;
    if (type !== "FINAL" || !path || path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]; const b = path[i + 1];
      if (
        (edge.source === a && edge.target === b) ||
        (edge.source === b && edge.target === a)
      ) return true;
    }
    return false;
  };

  const isRelaxingEdge = (edge) => {
    if (!currentStep?.highlightEdge) return false;
    const h = currentStep.highlightEdge;
    return (
      (edge.source === h.source && edge.target === h.target) ||
      (edge.source === h.target && edge.target === h.source)
    );
  };

  const getEdgeWidth = (edge) => {
    if (isShortestPathEdge(edge)) return 5;
    if (isRelaxingEdge(edge)) return 3;
    return 2;
  };

  const getEdgeMidpoint = (edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (!source || !target) return { x: 0, y: 0 };
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    };
  };

  // ---- Top 5 path edge color ----
  const getTop5EdgeColor = (edge) => {
    if (!top5Paths || top5Paths.length === 0) return null;

    for (let i = top5Paths.length - 1; i >= 0; i--) {
      const { path } = top5Paths[i];
      for (let j = 0; j < path.length - 1; j++) {
        const a = path[j]; const b = path[j + 1];
        if (
          (edge.source === a && edge.target === b) ||
          (edge.source === b && edge.target === a)
        ) return pathColors[i];
      }
    }
    return null;
  };

  const isEdgeOnSelectedPath = (edge) => {
    if (selectedPathIndex === null || !top5Paths) return false;
    const { path } = top5Paths[selectedPathIndex];
    for (let j = 0; j < path.length - 1; j++) {
      const a = path[j]; const b = path[j + 1];
      if (
        (edge.source === a && edge.target === b) ||
        (edge.source === b && edge.target === a)
      ) return true;
    }
    return false;
  };

  // Handle path click on canvas
  const handlePathEdgeClick = (e, pathIndex) => {
    e.stopPropagation();
    if (onPathClick) onPathClick(pathIndex);
  };

  return (
    <div className="relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800 w-full h-full">

      {/* Hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-600 text-sm">Click anywhere to add nodes</p>
        </div>
      )}

      {/* Path tooltip */}
      {pathTooltip && (
        <div
          className="absolute z-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white pointer-events-none"
          style={{ left: pathTooltip.x + 10, top: pathTooltip.y - 30 }}
        >
          <span style={{ color: pathColors[pathTooltip.index] }}>●</span>
          {" "}Path {pathTooltip.index + 1}: Cost = {pathTooltip.cost}
        </div>
      )}

      {/* Weight input popup */}
      {pendingWeight && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 shadow-xl border border-gray-600 w-64">
            <p className="text-white text-sm font-bold">
              Edge: {pendingWeight.source} → {pendingWeight.target}
            </p>
            <p className="text-gray-400 text-xs">Enter edge weight:</p>
            <input
              autoFocus
              type="number"
              min="1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleWeightConfirm()}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleWeightConfirm}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold"
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingWeight(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Top 5 path edges (background layer) */}
        {top5Paths && top5Paths.length > 0 && currentStep?.type === "FINAL" &&
          top5Paths.map((pathObj, pathIndex) =>
            pathObj.path.slice(0, -1).map((nodeId, i) => {
              const nextNodeId = pathObj.path[i + 1];
              const sourceNode = nodes.find((n) => n.id === nodeId);
              const targetNode = nodes.find((n) => n.id === nextNodeId);
              if (!sourceNode || !targetNode) return null;
              const color = pathColors[pathIndex];
              const isSelected = selectedPathIndex === pathIndex;
              const isShortest = pathIndex === 0;

              return (
                <line
                  key={`top5-${pathIndex}-${i}`}
                  x1={sourceNode.x} y1={sourceNode.y}
                  x2={targetNode.x} y2={targetNode.y}
                  stroke={color}
                  strokeWidth={isSelected ? 6 : isShortest ? 5 : 3}
                  strokeOpacity={isSelected ? 1 : isShortest ? 1 : 0.5}
                  strokeLinecap="round"
                  className={isShortest ? "edge-glow" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handlePathEdgeClick(e, pathIndex)}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current.getBoundingClientRect();
                    setPathTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      index: pathIndex,
                      cost: pathObj.cost,
                    });
                  }}
                  onMouseLeave={() => setPathTooltip(null)}
                  onTouchStart={(e) => {
                    handlePathEdgeClick(e, pathIndex);
                  }}
                />
              );
            })
          )
        }

        {/* Regular edges */}
        {edges.map((edge, index) => {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          const mid = getEdgeMidpoint(edge);
          const top5Color = getTop5EdgeColor(edge);
          const color = currentStep?.type === "FINAL" && top5Color
            ? top5Color
            : getEdgeColor(edge);
          const width = getEdgeWidth(edge);
          const relaxing = isRelaxingEdge(edge);
          const shortest = isShortestPathEdge(edge);
          const isNew = edge.isNew || index === newEdgeIndex;

          return (
            <g key={index}>
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
                className={`
                  ${isNew ? "edge-draw" : ""}
                  ${relaxing ? "edge-flow" : ""}
                  ${shortest ? "edge-glow" : ""}
                `}
              />
              {/* Weight label */}
              <rect
                x={mid.x - 12} y={mid.y - 10}
                width={24} height={20}
                rx={4}
                fill="#1f2937"
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={mid.x} y={mid.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight="bold"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const color = getNodeColor(node.id);
          const isSelected = selectedNode === node.id;
          const onFinalPath = isOnFinalPath(node.id);
          const isCurrentVisiting =
            currentStep?.currentNode === node.id &&
            currentStep?.type === "VISIT_NODE";
          const isRippling = rippleNode === node.id;

          return (
            <g
              key={node.id}
              onClick={(e) => handleNodeClick(e, node.id)}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onTouchStart={(e) => handleTouchStart(e, node.id)}
              style={{ cursor: isRunning ? "default" : "pointer" }}
              className={node.isNew ? "node-bounce" : ""}
            >
              {/* Ripple effect on destination */}
              {isRippling && (
                <>
                  <circle
                    cx={node.x} cy={node.y} r={20}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    style={{
                      animation: "ripple 0.8s ease-out forwards",
                    }}
                  />
                  <circle
                    cx={node.x} cy={node.y} r={20}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    style={{
                      animation: "ripple 0.8s ease-out 0.2s forwards",
                    }}
                  />
                </>
              )}

              {/* Pulse ring when visiting */}
              {isCurrentVisiting && (
                <circle
                  cx={node.x} cy={node.y} r={22}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={2}
                  opacity={0.6}
                  style={{
                    animation: "pulseRing 0.8s ease-out infinite",
                  }}
                />
              )}

              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={node.x} cy={node.y} r={26}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth={2}
                  strokeDasharray="5,3"
                />
              )}

              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y} r={20}
                fill={color}
                stroke={onFinalPath ? "#f97316" : "white"}
                strokeWidth={onFinalPath ? 3 : 2}
                className={onFinalPath ? "node-glow" : ""}
              />

              {/* Node label */}
              <text
                x={node.x} y={node.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontWeight="bold"
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}