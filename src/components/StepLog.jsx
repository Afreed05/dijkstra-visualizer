import React, { useEffect, useRef, useState } from "react";

export default function StepLog({ steps, currentStepIndex }) {
  const bottomRef = useRef(null);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [confetti, setConfetti] = useState(false);

  // Add steps one by one with slide in
  useEffect(() => {
    if (!steps || steps.length === 0) {
      setVisibleSteps([]);
      return;
    }

    setVisibleSteps(
      steps.slice(0, currentStepIndex + 1).map((step, index) => ({
        ...step,
        isNew: index === currentStepIndex,
      }))
    );

    // Trigger confetti on final step
    if (
      steps[currentStepIndex]?.type === "FINAL" ||
      steps[currentStepIndex]?.type === "DESTINATION_REACHED"
    ) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [currentStepIndex, steps]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleSteps]);

  const getIcon = (type) => {
    switch (type) {
      case "INIT":                return "🚀";
      case "VISIT_NODE":          return "👁️";
      case "RELAX_EDGE":          return "🔍";
      case "UPDATE_DISTANCE":     return "✅";
      case "NODE_DONE":           return "🏁";
      case "DESTINATION_REACHED": return "🎯";
      case "FINAL":               return "🏆";
      default:                    return "•";
    }
  };

  const getColor = (type, isActive) => {
    if (isActive) return "text-white";
    switch (type) {
      case "INIT":                return "text-blue-400";
      case "VISIT_NODE":          return "text-yellow-400";
      case "RELAX_EDGE":          return "text-purple-400";
      case "UPDATE_DISTANCE":     return "text-green-400";
      case "NODE_DONE":           return "text-gray-400";
      case "DESTINATION_REACHED": return "text-cyan-400";
      case "FINAL":               return "text-orange-400";
      default:                    return "text-gray-500";
    }
  };

  // Confetti pieces generator
  const confettiColors = [
    "#f97316", "#3b82f6", "#a855f7",
    "#06b6d4", "#84cc16", "#facc15",
  ];

  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 6}px`,
  }));

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 h-48">
        <h2 className="text-white font-bold text-lg mb-3">Step Log</h2>
        <p className="text-gray-500 text-sm">Steps will appear here...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 relative overflow-hidden">

      {/* Confetti overlay */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                backgroundColor: piece.color,
                left: piece.left,
                top: "-10px",
                width: piece.size,
                height: piece.size,
                animationDelay: piece.delay,
              }}
            />
          ))}
        </div>
      )}

      <h2 className="text-white font-bold text-lg mb-3">
        Step Log{" "}
        <span className="text-gray-500 text-sm font-normal">
          ({currentStepIndex + 1} / {steps.length})
        </span>
      </h2>

      {/* Scrollable log */}
      <div className="h-48 overflow-y-auto flex flex-col gap-1 pr-1">
        {visibleSteps.map((step, index) => {
          const isActive = index === currentStepIndex;

          return (
            <div
              key={index}
              className={`
                flex items-start gap-2 px-3 py-2 rounded-lg text-sm
                transition-all duration-300
                ${step.isNew ? "step-slide-in" : ""}
                ${isActive
                  ? "bg-white/10 border border-white/20"
                  : "bg-transparent"
                }
              `}
            >
              <span className="mt-0.5 text-base leading-none">
                {getIcon(step.type)}
              </span>
              <span className={getColor(step.type, isActive)}>
                {step.message}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}