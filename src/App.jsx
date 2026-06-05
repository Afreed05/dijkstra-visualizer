import React, { useState } from "react";
import GraphCanvas from "./components/GraphCanvas";
import ControlPanel from "./components/ControlPanel";
import DistanceTable from "./components/DistanceTable";
import StepLog from "./components/StepLog";
import { runDijkstra, findTop5Paths } from "./algorithms/dijkstra";
import { useAnimation } from "./hooks/useAnimation";
import ComplexityPanel from "./components/ComplexityPanel";

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [steps, setSteps] = useState([]);
  const [top5Paths, setTop5Paths] = useState([]);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState("canvas"); // canvas | controls | table | log

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isFinished,
    progress,
    speed,
    play,
    pause,
    nextStep,
    prevStep,
    reset,
    changeSpeed,
  } = useAnimation(steps);

  const isRunning = steps.length > 0;

  // Run algorithm
  const handlePlay = () => {
    if (steps.length > 0) {
      play();
      return;
    }
    if (!sourceId || !destinationId) return;

    const result = runDijkstra(nodes, edges, sourceId, destinationId);
    const paths = findTop5Paths(nodes, edges, sourceId, destinationId);
    setSteps(result.steps);
    setTop5Paths(paths);
    setSelectedPathIndex(0);
    setTimeout(() => play(), 100);
  };

  // Reset animation only
  const handleReset = () => {
    setSteps([]);
    setTop5Paths([]);
    setSelectedPathIndex(0);
    reset();
  };

  // Clear everything
  const handleClearAll = () => {
    setNodes([]);
    setEdges([]);
    setSourceId("");
    setDestinationId("");
    setSteps([]);
    setTop5Paths([]);
    setSelectedPathIndex(0);
    reset();
  };

  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-bold text-white">
            Dijkstra's Visualizer
          </h1>
          <p className="text-gray-500 text-xs hidden md:block">
            ADA — 4th Semester | Interactive Shortest Path Animation
          </p>
        </div>
        <div className="flex gap-3 text-xs md:text-sm text-gray-400">
          <span>Nodes: <span className="text-white font-bold">{nodes.length}</span></span>
          <span>Edges: <span className="text-white font-bold">{edges.length}</span></span>
          {isRunning && (
            <span className="hidden md:inline">
              Step: <span className="text-blue-400 font-bold">{currentStepIndex + 1}/{totalSteps}</span>
            </span>
          )}
        </div>
      </header>

      {/* ==========================================
          DESKTOP LAYOUT
      ========================================== */}
      <div className="hidden md:flex flex-1 gap-4 p-4 overflow-hidden">

        {/* Left: Canvas */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-h-0" style={{ minHeight: "420px" }}>
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              currentStep={currentStep}
              isRunning={isRunning}
              top5Paths={top5Paths}
              selectedPathIndex={selectedPathIndex}
              onPathClick={setSelectedPathIndex}
            />
          </div>

          {/* Final result bar */}
          {finalStep && isFinished && (
            <div className="bg-gray-900 rounded-xl px-5 py-3 border border-orange-500/30 flex items-center justify-between result-flash">
              <div>
                <p className="text-orange-400 font-bold text-sm">
                  🏆 Shortest Path Found
                </p>
                <p className="text-white text-lg font-mono font-bold mt-0.5">
                  {finalStep.path && finalStep.path.length > 0
                    ? finalStep.path.join(" → ")
                    : "No path found"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total Cost</p>
                <p className="text-orange-400 text-3xl font-black">
                  {finalStep.totalCost === Infinity ? "∞" : finalStep.totalCost}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Side Panel */}
        <div className="w-72 flex flex-col gap-4 overflow-y-auto">
          <ControlPanel
            nodes={nodes}
            sourceId={sourceId}
            destinationId={destinationId}
            onSourceChange={setSourceId}
            onDestinationChange={setDestinationId}
            onPlay={handlePlay}
            onPause={pause}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onReset={handleReset}
            onClearAll={handleClearAll}
            onSpeedChange={changeSpeed}
            isPlaying={isPlaying}
            isFinished={isFinished}
            progress={progress}
            speed={speed}
            hasSteps={steps.length > 0}
            top5Paths={top5Paths}
            selectedPathIndex={selectedPathIndex}
            onPathSelect={setSelectedPathIndex}
          />
          <DistanceTable nodes={nodes} currentStep={currentStep} />
          <ComplexityPanel
  nodes={nodes}
  edges={edges}
  currentStep={currentStep}
  isFinished={isFinished}
/>
          <StepLog steps={steps} currentStepIndex={currentStepIndex} />
        </div>
      </div>

      {/* ==========================================
          MOBILE LAYOUT
      ========================================== */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">

        {/* Mobile Tab Bar */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          {[
            { id: "canvas",   label: "🗺 Canvas"   },
            { id: "controls", label: "🎮 Controls" },
            { id: "table",    label: "📊 Table"    },
            { id: "log",      label: "📝 Log"      },
            { id: "complexity", label: "📈 Complexity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all
                ${mobileTab === tab.id
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-500"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Canvas Tab */}
        {mobileTab === "canvas" && (
          <div className="flex flex-col flex-1 gap-3 p-3 overflow-hidden">
            <div className="flex-1 mobile-canvas">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
                currentStep={currentStep}
                isRunning={isRunning}
                top5Paths={top5Paths}
                selectedPathIndex={selectedPathIndex}
                onPathClick={setSelectedPathIndex}
              />
            </div>

            {/* Final result on mobile */}
            {finalStep && isFinished && (
              <div className="bg-gray-900 rounded-xl px-4 py-3 border border-orange-500/30 result-flash">
                <p className="text-orange-400 font-bold text-sm">
                  🏆 Shortest Path
                </p>
                <p className="text-white font-mono font-bold text-sm mt-0.5">
                  {finalStep.path?.join(" → ") || "No path"}
                </p>
                <p className="text-orange-400 font-black text-xl mt-1">
                  Cost: {finalStep.totalCost === Infinity ? "∞" : finalStep.totalCost}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mobile Controls Tab */}
        {mobileTab === "controls" && (
          <div className="flex-1 overflow-y-auto p-3">
            <ControlPanel
              nodes={nodes}
              sourceId={sourceId}
              destinationId={destinationId}
              onSourceChange={setSourceId}
              onDestinationChange={setDestinationId}
              onPlay={handlePlay}
              onPause={pause}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              onReset={handleReset}
              onClearAll={handleClearAll}
              onSpeedChange={changeSpeed}
              isPlaying={isPlaying}
              isFinished={isFinished}
              progress={progress}
              speed={speed}
              hasSteps={steps.length > 0}
              top5Paths={top5Paths}
              selectedPathIndex={selectedPathIndex}
              onPathSelect={(index) => {
                setSelectedPathIndex(index);
                setMobileTab("canvas");
              }}
            />
          </div>
        )}

        {/* Mobile Table Tab */}
        {mobileTab === "table" && (
          <div className="flex-1 overflow-y-auto p-3">
            <DistanceTable nodes={nodes} currentStep={currentStep} />
          </div>
        )}

        {/* Mobile Log Tab */}
        {mobileTab === "log" && (
          <div className="flex-1 overflow-y-auto p-3">
            <StepLog steps={steps} currentStepIndex={currentStepIndex} />
          </div>
        )}

        {/* Mobile Complexity Tab */}
        {mobileTab === "complexity" && (
          <div className="flex-1 overflow-y-auto p-3">
            <ComplexityPanel nodes={nodes} edges={edges} currentStep={currentStep} isFinished={isFinished} />
          </div>
        )}

      </div>
    </div>
  );
}