import { Edge } from 'reactflow'; // Removed unused Node import
import { SlideNode, Layer } from '../types'; // Import Layer type

// --- Constants ---
const LOCALSTORAGE_KEY_NODES = 'pptWebNodes';
const LOCALSTORAGE_KEY_EDGES = 'pptWebEdges';

// Define default layers for the initial node
const defaultLayers: Layer[] = [
  { id: `1-bg`, type: 'background', name: '背景', style: { backgroundColor: '#ffffff', width: '100%', height: '100%', zIndex: 0 } },
  { id: `1-title`, type: 'title', name: '标题', content: `标题 1`, style: { top: '20px', left: '20px', width: 'calc(100% - 40px)', height: 'auto', zIndex: 1, fontSize: '24px', fontWeight: 'bold' }, textFormat: { textAlign: 'center' } },
];

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
    // These might come from the node type definition or be set dynamically
    width: 320, // Match SlideNode style
    height: 180, // Match SlideNode style
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