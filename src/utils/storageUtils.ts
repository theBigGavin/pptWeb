import { Edge, Node } from 'reactflow'; // Import Node type
import { SlideNode, Layer, NodeData } from '../types'; // Import Layer and NodeData types

// --- Constants ---
export const LOCALSTORAGE_KEY_NODES = 'pptWebNodes'; // Export constant
export const LOCALSTORAGE_KEY_EDGES = 'pptWebEdges'; // Export constant

// Define default layers for the initial node
const defaultLayers: Layer[] = [
  { id: `1-bg`, type: 'background', name: '背景', style: { backgroundColor: '#ffffff', width: '100%', height: '100%', zIndex: 0 } },
  { id: `1-title`, type: 'title', name: '标题', content: `标题 1`, style: { top: '20px', left: '20px', width: 'calc(100% - 40px)', height: 'auto', zIndex: 1, fontSize: '24px', fontWeight: 'bold' }, textFormat: { textAlign: 'center' } },
];

// Define default initial nodes specifically as SlideNode[]
const defaultInitialNodes: SlideNode[] = [
  {
    id: "1",
    type: "slideNode",
    data: {
      label: "PPT 页面 1",
      layers: defaultLayers, // Use the new layers structure
    },
    position: { x: 100, y: 100 },
    // Ensure width and height are set if SlideNode component relies on them
    width: 320, // Match SlideNode style
    height: 180, // Match SlideNode style
  },
];

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