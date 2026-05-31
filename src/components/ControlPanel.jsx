import React, { useState } from "react";
import { pathColors } from "../algorithms/dijkstra";

export default function ControlPanel({
  nodes,
  sourceId,
  destinationId,
  onSourceChange,
  onDestinationChange,
  onPlay,
  onPause,
  onNextStep,
  onPrevStep,
  onReset,
  onClearAll,
  onSpeedChange,
  isPlaying,
  isFinished,
  progress,
  speed,
  hasSteps,
  top5Paths,
  selectedPathIndex,
  onPathSelect,
}) {
  const speedOptions = [
    { label: "Slow",   value: 1500 },
    { label: "Medium", value: 800  },
    { label: "Fast",   value: 300  },
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-4">
      <h2 className="text-white font-bold text-lg">Control Panel</h2>

      {/* Source & Destination */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">Source Node</label>
        <select
          value={sourceId}
          onChange={(e) => onSourceChange(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Select --</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              Node {node.id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">Destination Node</label>
        <select
          value={destinationId}
          onChange={(e) => onDestinationChange(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Select --</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}
              disabled={node.id === sourceId}
            >
              Node {node.id}
            </option>
          ))}
        </select>
      </div>

      {/* Speed */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">Animation Speed</label>
        <div className="flex gap-2">
          {speedOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all
                ${speed === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {hasSteps && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Playback Buttons */}
      <div className="flex flex-col gap-2">

        {/* Run Algorithm */}
        {!hasSteps && (
          <button
            onClick={onPlay}
            disabled={!sourceId || !destinationId}
            className={`w-full py-2.5 rounded-lg font-bold text-sm text-white
              transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${sourceId && destinationId
                ? "bg-green-600 hover:bg-green-500 button-pulse"
                : "bg-green-600"
              }`}
          >
            ▶ Run Algorithm
          </button>
        )}

        {/* Play / Pause */}
        {hasSteps && !isFinished && (
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all text-white
              ${isPlaying
                ? "bg-yellow-600 hover:bg-yellow-500"
                : "bg-green-600 hover:bg-green-500"
              }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        )}

        {/* Finished */}
        {hasSteps && isFinished && (
          <div className="w-full py-2.5 rounded-lg font-bold text-sm text-center bg-orange-600 text-white result-flash">
            🏆 Algorithm Complete
          </div>
        )}

        {/* Prev / Next */}
        {hasSteps && (
          <div className="flex gap-2">
            <button
              onClick={onPrevStep}
              className="flex-1 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
            >
              ⏮ Prev
            </button>
            <button
              onClick={onNextStep}
              disabled={isFinished}
              className="flex-1 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 transition-all"
            >
              Next ⏭
            </button>
          </div>
        )}

        {/* Reset */}
        {hasSteps && (
          <button
            onClick={onReset}
            className="w-full py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
          >
            🔄 Reset Animation
          </button>
        )}

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className="w-full py-2 rounded-lg text-sm bg-red-900/50 text-red-400 hover:bg-red-900 transition-all"
        >
          🗑 Clear All
        </button>
      </div>

      {/* Top 5 Paths Panel */}
      {top5Paths && top5Paths.length > 0 && isFinished && (
        <div className="flex flex-col gap-2 fade-in">
          <label className="text-gray-400 text-sm font-bold">
            Top {top5Paths.length} Paths
          </label>
          <p className="text-gray-600 text-xs">
            Tap any path to highlight it
          </p>
          {top5Paths.map((pathObj, index) => (
            <button
              key={index}
              onClick={() => onPathSelect(index)}
              className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all border
                ${selectedPathIndex === index
                  ? "border-white/40 bg-white/10"
                  : "border-transparent bg-gray-800 hover:bg-gray-700"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pathColors[index] }}
                  />
                  <span className="text-gray-300 font-mono text-xs">
                    {pathObj.path.join(" → ")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="font-bold text-sm"
                    style={{ color: pathColors[index] }}
                  >
                    {pathObj.cost}
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}