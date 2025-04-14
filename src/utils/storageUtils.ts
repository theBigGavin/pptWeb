import { Edge } from 'reactflow'; // Removed unused Node import
import { SlideNode } from '../types'; // Removed unused NodeData import

// --- Constants ---
const LOCALSTORAGE_KEY_NODES = 'pptWebNodes';
const LOCALSTORAGE_KEY_EDGES = 'pptWebEdges';

const defaultInitialNodes: SlideNode[] = [
  {
    id: "1",
    type: "slideNode",
    data: {
      label: "PPT 页面 1",
      content1: "这是第一页的内容...",
      layout: "title_content",
    },
    position: { x: 100, y: 100 },
  },
];

// --- Initial State Loading ---
export const loadInitialState = (): { initialNodes: SlideNode[], initialEdges: Edge[] } => {
  const storedNodes = localStorage.getItem(LOCALSTORAGE_KEY_NODES);
  const storedEdges = localStorage.getItem(LOCALSTORAGE_KEY_EDGES);

  let initialNodes: SlideNode[] = defaultInitialNodes; // Default value
  let initialEdges: Edge[] = [];

  if (storedNodes) {
    try {
      const parsedNodes = JSON.parse(storedNodes);
      // Basic validation: check if it's an array
      if (Array.isArray(parsedNodes)) {
        // TODO: Add more robust validation for node structure if needed
        initialNodes = parsedNodes;
      } else {
        console.error("Stored nodes data is not an array, using default.");
      }
    } catch (error) {
      console.error("Error parsing stored nodes:", error);
      // Fallback to default if parsing fails
    }
  }

  if (storedEdges) {
    try {
      const parsedEdges = JSON.parse(storedEdges);
      if (Array.isArray(parsedEdges)) {
        // TODO: Add more robust validation for edge structure if needed
        initialEdges = parsedEdges;
      } else {
        console.error("Stored edges data is not an array, using default.");
      }
    } catch (error) {
      console.error("Error parsing stored edges:", error);
      // Fallback to empty array
    }
  }

  return { initialNodes, initialEdges };
};

// --- State Saving ---
export const saveNodesToStorage = (nodes: SlideNode[]) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY_NODES, JSON.stringify(nodes));
  } catch (error) {
    console.error("Error saving nodes to localStorage:", error);
  }
};

export const saveEdgesToStorage = (edges: Edge[]) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY_EDGES, JSON.stringify(edges));
  } catch (error) {
    console.error("Error saving edges to localStorage:", error);
  }
};