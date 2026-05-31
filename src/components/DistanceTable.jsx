import React, { useEffect, useRef, useState } from "react";

export default function DistanceTable({ nodes, currentStep }) {
  const [prevDistances, setPrevDistances] = useState({});
  const [flashNodes, setFlashNodes] = useState(new Set());
  const [popNodes, setPopNodes] = useState(new Set());

  // Detect distance changes and trigger flash + pop
  useEffect(() => {
    if (!currentStep) return;

    const newFlash = new Set();
    const newPop = new Set();

    nodes.forEach((node) => {
      const oldDist = prevDistances[node.id];
      const newDist = currentStep.distances[node.id];

      if (oldDist !== undefined && oldDist !== newDist) {
        newFlash.add(node.id);
        newPop.add(node.id);
      }
    });

    if (newFlash.size > 0) {
      setFlashNodes(newFlash);
      setPopNodes(newPop);

      // Remove after animation
      setTimeout(() => {
        setFlashNodes(new Set());
        setPopNodes(new Set());
      }, 800);
    }

    setPrevDistances({ ...currentStep.distances });
  }, [currentStep]);

  if (!currentStep) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-white font-bold text-lg mb-3">
          Distance Table
        </h2>
        <p className="text-gray-500 text-sm">
          Run the algorithm to see distances
        </p>
      </div>
    );
  }

  const { distances, visited, currentNode } = currentStep;

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-white font-bold text-lg mb-3">
        Distance Table
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2">Node</th>
            <th className="text-left py-2">Distance</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const isVisited = visited.has(node.id);
            const isCurrent = currentNode === node.id;
            const distance = distances[node.id];
            const isFlashing = flashNodes.has(node.id);
            const isPopping = popNodes.has(node.id);

            // Row color
            let rowClass = "border-b border-gray-800 transition-all duration-300 ";
            if (isFlashing) rowClass += "flash-update ";
            else if (isCurrent) rowClass += "bg-yellow-900/40 ";
            else if (isVisited) rowClass += "bg-green-900/20 ";

            // Distance color
            let distClass = "font-mono font-bold ";
            if (distance === Infinity) distClass += "text-gray-500";
            else if (isCurrent) distClass += "text-yellow-400";
            else if (isVisited) distClass += "text-green-400";
            else distClass += "text-blue-400";

            // Status badge
            let badge = null;
            if (isCurrent) {
              badge = (
                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  Visiting
                </span>
              );
            } else if (isVisited) {
              badge = (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Done
                </span>
              );
            } else {
              badge = (
                <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  Waiting
                </span>
              );
            }

            return (
              <tr key={node.id} className={rowClass}>
                {/* Node name */}
                <td className="py-2 text-white font-bold">
                  {node.id}
                </td>

                {/* Distance value with pop animation */}
                <td className={`py-2 ${distClass}`}>
                  <span className={isPopping ? "number-pop" : ""}>
                    {distance === Infinity ? "∞" : distance}
                  </span>
                </td>

                {/* Status badge */}
                <td className="py-2">{badge}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}