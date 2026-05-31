// ==========================================
// DIJKSTRA - SHORTEST PATH + ALL STEPS
// ==========================================

export function runDijkstra(nodes, edges, sourceId, destinationId) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const steps = [];

  // Initialize
  nodes.forEach((node) => {
    dist[node.id] = Infinity;
    prev[node.id] = null;
  });

  dist[sourceId] = 0;

  steps.push({
    type: "INIT",
    distances: { ...dist },
    visited: new Set(),
    currentNode: null,
    highlightEdge: null,
    message: `Starting at Node ${sourceId}. All distances set to ∞ except source = 0`,
  });

  while (true) {
    // Pick unvisited node with smallest distance
    let currentNode = null;
    let smallestDist = Infinity;

    nodes.forEach((node) => {
      if (!visited.has(node.id) && dist[node.id] < smallestDist) {
        smallestDist = dist[node.id];
        currentNode = node.id;
      }
    });

    if (currentNode === null) break;

    if (currentNode === destinationId) {
      steps.push({
        type: "DESTINATION_REACHED",
        distances: { ...dist },
        visited: new Set(visited),
        currentNode,
        highlightEdge: null,
        message: `Destination Node ${destinationId} reached!`,
      });
      break;
    }

    steps.push({
      type: "VISIT_NODE",
      distances: { ...dist },
      visited: new Set(visited),
      currentNode,
      highlightEdge: null,
      message: `Visiting Node ${currentNode} with distance ${dist[currentNode]}`,
    });

    visited.add(currentNode);

    const neighbors = edges.filter(
      (e) => e.source === currentNode || e.target === currentNode
    );

    neighbors.forEach((edge) => {
      const neighborId =
        edge.source === currentNode ? edge.target : edge.source;

      if (visited.has(neighborId)) return;

      const newDist = dist[currentNode] + edge.weight;

      steps.push({
        type: "RELAX_EDGE",
        distances: { ...dist },
        visited: new Set(visited),
        currentNode,
        highlightEdge: { source: edge.source, target: edge.target },
        message: `Checking edge ${currentNode} → ${neighborId}. Current best = ${
          dist[neighborId] === Infinity ? "∞" : dist[neighborId]
        }, New = ${newDist}`,
      });

      if (newDist < dist[neighborId]) {
        dist[neighborId] = newDist;
        prev[neighborId] = currentNode;

        steps.push({
          type: "UPDATE_DISTANCE",
          distances: { ...dist },
          visited: new Set(visited),
          currentNode,
          highlightEdge: { source: edge.source, target: edge.target },
          message: `Updated Node ${neighborId} distance to ${newDist} via ${currentNode}`,
        });
      }
    });

    steps.push({
      type: "NODE_DONE",
      distances: { ...dist },
      visited: new Set(visited),
      currentNode,
      highlightEdge: null,
      message: `Node ${currentNode} fully processed and marked visited`,
    });
  }

  // Reconstruct shortest path
  const path = [];
  let current = destinationId;
  while (current !== null) {
    path.unshift(current);
    current = prev[current];
  }

  const validPath = path[0] === sourceId ? path : [];

  steps.push({
    type: "FINAL",
    distances: { ...dist },
    visited: new Set(visited),
    currentNode: null,
    highlightEdge: null,
    path: validPath,
    totalCost: dist[destinationId],
    message:
      validPath.length > 0
        ? `Shortest path: ${validPath.join(" → ")} | Total cost: ${dist[destinationId]}`
        : `No path found from ${sourceId} to ${destinationId}`,
  });

  return { steps, path: validPath, totalCost: dist[destinationId] };
}

// ==========================================
// FIND TOP 5 PATHS - DFS BASED
// ==========================================

export function findTop5Paths(nodes, edges, sourceId, destinationId) {
  const allPaths = [];

  // Build adjacency list
  const adjacency = {};
  nodes.forEach((n) => (adjacency[n.id] = []));
  edges.forEach((edge) => {
    adjacency[edge.source].push({ node: edge.target, weight: edge.weight });
    adjacency[edge.target].push({ node: edge.source, weight: edge.weight });
  });

  // DFS to find all paths
  const dfs = (current, destination, visited, currentPath, currentCost) => {
    if (current === destination) {
      allPaths.push({ path: [...currentPath], cost: currentCost });
      return;
    }

    // Limit path length to avoid infinite loops on cyclic graphs
    if (currentPath.length > nodes.length) return;

    for (const neighbor of adjacency[current]) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        currentPath.push(neighbor.node);
        dfs(
          neighbor.node,
          destination,
          visited,
          currentPath,
          currentCost + neighbor.weight
        );
        currentPath.pop();
        visited.delete(neighbor.node);
      }
    }
  };

  const startVisited = new Set([sourceId]);
  dfs(sourceId, destinationId, startVisited, [sourceId], 0);

  // Sort by cost and return top 5
  allPaths.sort((a, b) => a.cost - b.cost);
  return allPaths.slice(0, 5);
}

// ==========================================
// PATH COLORS FOR TOP 5
// ==========================================

export const pathColors = [
  "#f97316", // orange  - shortest (rank 1)
  "#3b82f6", // blue    - rank 2
  "#a855f7", // purple  - rank 3
  "#06b6d4", // cyan    - rank 4
  "#84cc16", // green   - rank 5
];