import { Edge, Node } from 'reactflow'; // Import Node type
import { SlideNode, NodeData } from '../types'; // Import NodeData types, removed unused Layer

// --- Constants ---
export const LOCALSTORAGE_KEY_NODES = 'pptWebNodes'; // Export constant
export const LOCALSTORAGE_KEY_EDGES = 'pptWebEdges'; // Export constant

// Define default initial nodes specifically as SlideNode[]
// Changed to an empty array to start with a blank canvas by default
const defaultInitialNodes: SlideNode[] = [];

// --- Initial State Loading ---
// Return type should match the state structure in App.tsx (Node<NodeData>[])
export const loadInitialState = (): { initialNodes: Node<NodeData>[], initialEdges: Edge[] } => {
  const storedNodes = localStorage.getItem(LOCALSTORAGE_KEY_NODES);
  const storedEdges = localStorage.getItem(LOCALSTORAGE_KEY_EDGES);

  // Default value should also match the expected return type
  let initialNodes: Node<NodeData>[] = defaultInitialNodes as Node<NodeData>[]; // Cast default
  let initialEdges: Edge[] = [];

  if (storedNodes) {
    try {
      const parsedNodes = JSON.parse(storedNodes);
      // Basic validation: check if it's an array
      if (Array.isArray(parsedNodes)) {
        // TODO: Add more robust validation for node structure if needed
        initialNodes = parsedNodes as Node<NodeData>[]; // Cast parsed data
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
// Function signature should accept the type used in App.tsx state (Node<NodeData>[])
export const saveNodesToStorage = (nodes: Node<NodeData>[]) => {
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