import React from "react";

export default function ComplexityPanel({ nodes, edges, currentStep, isFinished }) {
  const V = nodes.length;
  const E = edges.length;

  const timeComplexity = "O(V²)";
  const spaceComplexity = "O(V)";

  const visitedCount = currentStep?.visited?.size || 0;
  const progress = V > 0 ? Math.round((visitedCount / V) * 100) : 0;

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
      <h2 className="text-white font-bold text-lg">Complexity Panel</h2>

      {/* Time & Space */}
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Time Complexity</p>
          <p className="text-yellow-400 font-black text-xl font-mono">{timeComplexity}</p>
          <p className="text-gray-500 text-xs mt-1">Simple implementation</p>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Space Complexity</p>
          <p className="text-blue-400 font-black text-xl font-mono">{spaceComplexity}</p>
          <p className="text-gray-500 text-xs mt-1">Distance array</p>
        </div>
      </div>

      {/* Live Stats */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">
          Live Graph Stats
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Vertices (V)</p>
            <p className="text-white font-bold font-mono text-lg">{V}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Edges (E)</p>
            <p className="text-white font-bold font-mono text-lg">{E}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Visited</p>
            <p className="text-green-400 font-bold font-mono text-lg">{visitedCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Remaining</p>
            <p className="text-orange-400 font-bold font-mono text-lg">
              {Math.max(0, V - visitedCount)}
            </p>
          </div>
        </div>
      </div>

      {/* Operations count */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Nodes Processed</span>
          <span className="text-white font-mono">{visitedCount} / {V}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Worst case calculation */}
      <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
        <p className="text-gray-400 text-xs font-bold">Worst Case Operations</p>
        <p className="text-white text-sm font-mono">
          V² = {V}² = <span className="text-yellow-400 font-bold">{V * V}</span>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          With priority queue: O((V + E) log V) = {((V + E) * Math.max(1, Math.round(Math.log2(V || 1)))).toFixed(0)} ops
        </p>
      </div>

      {/* Algorithm class */}
      <div className="bg-orange-900/20 border border-orange-900/40 rounded-xl p-3">
        <p className="text-orange-300 text-xs font-bold mb-1">Algorithm Class</p>
        <div className="flex flex-wrap gap-1">
          {["Greedy", "Graph", "Shortest Path", "Single Source"].map((tag) => (
            <span
              key={tag}
              className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Final summary */}
      {isFinished && (
        <div className="bg-green-900/20 border border-green-900/40 rounded-xl p-3 fade-in">
          <p className="text-green-300 text-xs font-bold mb-1">✅ Run Complete</p>
          <p className="text-gray-400 text-xs">
            Processed {visitedCount} nodes across {E} edges.
          </p>
        </div>
      )}
    </div>
  );
}