import { Edge } from 'reactflow'; // Removed unused Node import
import { SlideNode } from '../types'; // Import SlideNode type

// Helper to find the start node (no incoming edges)
const findStartNode = (nodesToSearch: SlideNode[], edgesToSearch: Edge[]): SlideNode | null => {
  const targetNodeIds = new Set(edgesToSearch.map(edge => edge.target));
  return nodesToSearch.find(node => !targetNodeIds.has(node.id)) || null;
};

// Function to get nodes in order based on connections
export const getNodesInOrder = (nodesToSort: SlideNode[], edgesToSort: Edge[]): SlideNode[] => {
  const startNode = findStartNode(nodesToSort, edgesToSort);
  if (!startNode) {
    // If no clear start node (e.g., empty graph or all nodes have inputs), return original order or sort by position as fallback
    console.warn("No clear start node found, returning nodes potentially unsorted or sorted by Y position.");
    return [...nodesToSort].sort((a, b) => a.position.y - b.position.y);
  }


  const orderedNodes: SlideNode[] = [];
  const visited = new Set<string>();
  const edgesMap = new Map<string, string>(); // Map sourceId to targetId for quick lookup

  edgesToSort.forEach(edge => {
    edgesMap.set(edge.source, edge.target);
  });

  let currentNode: SlideNode | undefined = startNode;
  while (currentNode && !visited.has(currentNode.id)) {
    orderedNodes.push(currentNode);
    visited.add(currentNode.id);
    const targetId = edgesMap.get(currentNode.id);
    currentNode = targetId ? nodesToSort.find(n => n.id === targetId) : undefined;
    if (orderedNodes.length > nodesToSort.length * 2) { // More robust cycle detection / runaway loop prevention
      console.error("Potential cycle detected or error in node ordering logic. Returning original order.");
      return nodesToSort;
    }
  }

  // Add any remaining nodes not part of the main flow (e.g., disconnected nodes or nodes in parallel paths)
  // Sort remaining nodes by Y position to maintain some visual order
  const remainingNodes = nodesToSort
    .filter(node => !visited.has(node.id))
    .sort((a, b) => a.position.y - b.position.y);

  orderedNodes.push(...remainingNodes);


  return orderedNodes;
};

// Removed fixed nodeWidth/nodeHeight constants as we now use actual node dimensions

// Function to apply automatic HORIZONTAL layout based on node order
export const applyAutoLayout = (orderedNodes: SlideNode[]): SlideNode[] => {
  const horizontalSpacing = 80; // Space between nodes horizontally
  const initialY = 100; // Fixed Y position for horizontal layout
  let currentX = 50; // Starting X position

  return orderedNodes.map((node) => {
    const nodeWidth = node.width ?? 600; // Use actual width or fallback matching App.tsx baseWidth
    const newNode = {
      ...node,
      position: { x: currentX, y: initialY }, // Set position
    };
    currentX += nodeWidth + horizontalSpacing; // Update X for the next node
    return newNode;
  });
};