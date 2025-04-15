import React, { useState, useEffect, useCallback, useMemo } from "react";
// Import necessary hooks and types from reactflow
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node, // Keep Node type
  useReactFlow, // Keep for fitView etc.
  NodeMouseHandler, // Import NodeMouseHandler type
  // NodeChange, // Removed unused import
  // EdgeChange, // Removed unused import
  OnNodesChange,
  OnEdgesChange,
} from "reactflow";

import FlowCanvas from "./components/FlowCanvas";
import LayerPanel from "./components/LayerPanel";
// Import all needed types from types.ts
import {
  SlideNode,
  Layer,
  NodeData,
  Theme,
  TextLayer,
  TitleLayer,
  FooterLayer,
  LayerType,
} from "./types"; // Ensure LayerType is imported
// Import storage utils & keys (Ensure keys are exported from storageUtils)
import {
  loadInitialState,
  saveNodesToStorage,
  saveEdgesToStorage,
  LOCALSTORAGE_KEY_NODES,
  LOCALSTORAGE_KEY_EDGES,
} from "./utils/storageUtils";
import { getNodesInOrder, applyAutoLayout } from "./utils/nodeUtils"; // Import node utils
import { exportPresentation as exportPresentationUtil } from "./utils/exportUtils"; // Import export utils
import "./styles/main.css";

const THEME_STORAGE_KEY = "pptweb-theme";

// Wrap App content to use useReactFlow hook
const AppContent: React.FC = () => {
  // --- Load Initial State ---
  const { initialNodes, initialEdges } = loadInitialState();

  // --- Core React Flow State (Lifted) ---
  // Use Node<NodeData> for nodes state type
  const [nodes, setNodes, onNodesChange]: [
    Node<NodeData>[],
    React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
    OnNodesChange
  ] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange]: [
    Edge[],
    React.Dispatch<React.SetStateAction<Edge[]>>,
    OnEdgesChange
  ] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow<NodeData>(); // Get instance for fitView etc.

  // --- UI State ---
  const [isLayerPanelVisible, setIsLayerPanelVisible] = useState(false);
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] =
    useState(false);
  // Store only the ID of the selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null); // Correct state setter

  // Derive selectedNode object from state
  // Ensure the derived node is cast to SlideNode for type safety
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const foundNode = nodes.find((n) => n.id === selectedNodeId);
    // Check if foundNode exists and has the correct type structure before casting
    if (foundNode && foundNode.type === "slideNode") {
      return foundNode as SlideNode;
    }
    return null; // Return null if not found or not a SlideNode
  }, [nodes, selectedNodeId]);

  // --- Theme State Management ---
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (storedTheme as Theme) || "system";
  });

  const applyTheme = useCallback((selectedTheme: Theme) => {
    let effectiveTheme: "light" | "dark";
    if (selectedTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      effectiveTheme = selectedTheme;
    }
    document.body.dataset.theme = effectiveTheme;
    // console.log(`Applied theme: ${effectiveTheme} (Selected: ${selectedTheme})`); // Optional logging
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // console.log("System theme changed, reapplying..."); // Optional logging
      applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // --- State Persistence (Lifted) ---
  useEffect(() => {
    // Ensure nodes being saved are SlideNode compatible if needed, though saving generic Node<NodeData> is fine
    saveNodesToStorage(nodes); // Pass Node<NodeData>[] directly as save function now accepts it
  }, [nodes]);

  useEffect(() => {
    saveEdgesToStorage(edges);
  }, [edges]);

  // --- Panel Visibility Handlers ---
  // Use NodeMouseHandler type for consistency
  const handleNodeSelect: NodeMouseHandler = useCallback(
    (_event, node) => {
      setIsLayerPanelVisible(true);
      setIsPropertiesPanelVisible(true);
      setSelectedNodeId(node.id); // Store the ID
      // setSelectedLayerId(null); // DO NOT reset layer selection when node is selected
    },
    // Remove setSelectedLayerId from dependencies as it's no longer set here
    [setSelectedNodeId, setIsLayerPanelVisible, setIsPropertiesPanelVisible]
  ); // Dependencies are correct

  const handleCanvasClick = useCallback(() => {
    setIsLayerPanelVisible(false);
    setIsPropertiesPanelVisible(false);
    setSelectedNodeId(null); // Deselect node
    setSelectedLayerId(null); // Deselect layer
  }, [setSelectedNodeId, setSelectedLayerId]); // Dependencies are correct

  // Handler to update theme state
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  // --- End Theme State Management ---

  // --- Layer Data Update Handler (Implemented with setNodes) ---
  const updateLayerData = useCallback(
    (nodeId: string, layerId: string, newLayerData: Partial<Layer>) => {
      setNodes((nds) =>
        nds.map((node) => {
          // Ensure we are working with a SlideNode structure for data access
          if (node.id === nodeId && node.type === "slideNode") {
            const slideNode = node as SlideNode; // Cast to SlideNode
            // Ensure node.data and node.data.layers exist
            const currentData = slideNode.data || { label: "", layers: [] };
            const currentLayers = currentData.layers || [];

            const updatedLayers = currentLayers.map((layer): Layer => {
              // Add return type annotation
              if (layer.id === layerId) {
                // Create a base updated layer
                const updatedLayer = { ...layer, ...newLayerData }; // Use const

                // Deep merge style
                if (newLayerData.style) {
                  updatedLayer.style = {
                    ...(layer.style || {}),
                    ...newLayerData.style,
                  };
                }

                // Deep merge textFormat only if the layer type supports it AND new data provides it
                if (
                  (layer.type === "text" ||
                    layer.type === "title" ||
                    layer.type === "footer") &&
                  "textFormat" in newLayerData &&
                  newLayerData.textFormat
                ) {
                  // Type assertion to access textFormat safely
                  const currentTextLayer = layer as
                    | TextLayer
                    | TitleLayer
                    | FooterLayer;
                  const currentTextFormat = currentTextLayer.textFormat || {};
                  // Ensure updatedLayer is also treated as having textFormat
                  (
                    updatedLayer as TextLayer | TitleLayer | FooterLayer
                  ).textFormat = {
                    ...currentTextFormat,
                    ...(newLayerData.textFormat || {}), // Ensure newLayerData.textFormat is not null/undefined
                  };
                }
                // Add similar checks for other deep-merge properties (e.g., tableStyle) if needed

                return updatedLayer as Layer; // Assert final type
              }
              return layer;
            });
            // Return the updated node, preserving its original structure but with new data
            return {
              ...slideNode,
              data: { ...currentData, layers: updatedLayers },
            };
          }
          return node; // Return other nodes unchanged
        })
      );
      // No need to update selectedNode state directly here,
      // useMemo will derive the updated selectedNode object when nodes array changes.
    },
    [setNodes]
  ); // Dependency is correct

  // --- Node/Edge Operations (Lifted) ---
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges] // Dependency is correct
  );

  const addSlideNode = useCallback(() => {
    const existingIds = nodes
      .map((n) => parseInt(n.id, 10))
      .filter((id) => !isNaN(id));
    const nextIdNumber =
      existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newNodeId = nextIdNumber.toString();

    // Ensure the new node conforms to Node<NodeData> but has SlideNode structure in data
    const newNode: SlideNode = {
      id: newNodeId,
      type: "slideNode", // Ensure this matches the registered node type
      data: {
        label: `PPT 页面 ${newNodeId}`,
        layers: [
          {
            id: `${newNodeId}-bg`,
            type: "background",
            name: "背景",
            style: {
              backgroundColor: "#ffffff",
              width: "100%",
              height: "100%",
              zIndex: 0,
            },
          },
          {
            id: `${newNodeId}-title`,
            type: "title",
            name: "标题",
            content: `标题 ${newNodeId}`,
            style: {
              top: "20px",
              left: "20px",
              width: "calc(100% - 40px)",
              height: "auto",
              zIndex: 1,
              fontSize: "24px",
              fontWeight: "bold",
            },
            textFormat: { textAlign: "center" },
          },
        ],
      },
      // Calculate position based on existing nodes
      position: {
        x: 150,
        y:
          nodes.length > 0
            ? Math.max(...nodes.map((n) => n.position?.y ?? 0)) + 230
            : 100,
      }, // Added nullish coalescing for position.y
      // Add width/height if needed by React Flow or custom node
      width: 320,
      height: 180,
    };
    setNodes((nds) => nds.concat(newNode));

    // Focus using reactFlowInstance
    setTimeout(() => {
      // Use default dimensions if node width/height are not available yet
      const nodeWidth = newNode.width ?? 320;
      const nodeHeight = newNode.height ?? 180;
      reactFlowInstance?.setCenter(
        newNode.position.x + nodeWidth / 2,
        newNode.position.y + nodeHeight / 2,
        { zoom: 1, duration: 300 }
      );
    }, 50);
  }, [nodes, setNodes, reactFlowInstance]); // Dependencies are correct

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null); // Deselect if the deleted node was selected
        setSelectedLayerId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId, setSelectedNodeId, setSelectedLayerId]
  ); // Dependencies are correct

  const handleAutoLayout = useCallback(() => {
    // Ensure nodes passed to utils are SlideNode compatible if needed
    const orderedNodes = getNodesInOrder(nodes as SlideNode[], edges);
    const layoutedNodes = applyAutoLayout(orderedNodes);
    // Update state with nodes that conform to Node<NodeData>
    setNodes(layoutedNodes as Node<NodeData>[]); // Cast back if necessary
    // Optionally fit view after layout
    setTimeout(() => reactFlowInstance?.fitView({ duration: 300 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]); // Dependencies are correct

  const handleExport = useCallback(() => {
    // Ensure nodes passed to utils are SlideNode compatible
    exportPresentationUtil(nodes as SlideNode[], edges);
  }, [nodes, edges]); // Dependencies are correct

  const handleClearStorage = useCallback(() => {
    if (
      window.confirm("确定要清除所有本地存储的页面数据吗？此操作不可撤销。")
    ) {
      localStorage.removeItem(LOCALSTORAGE_KEY_NODES);
      localStorage.removeItem(LOCALSTORAGE_KEY_EDGES);
      // Reload the page to apply default state
      window.location.reload();
    }
  }, []); // No dependencies needed

  const deleteLayer = useCallback(
    (nodeId: string, layerId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.type === "slideNode") {
            const slideNode = node as SlideNode;
            const currentLayers = slideNode.data.layers || [];
            const updatedLayers = currentLayers.filter(
              (layer) => layer.id !== layerId
            );
            // If the deleted layer was selected, deselect it
            if (selectedLayerId === layerId) {
              setSelectedLayerId(null);
            }
            return {
              ...slideNode,
              data: { ...slideNode.data, layers: updatedLayers },
            };
          }
          return node;
        })
      );
    },
    [setNodes, selectedLayerId, setSelectedLayerId] // Add dependencies
  );

  const addLayer = useCallback(
    (nodeId: string, layerType: LayerType) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId && node.type === "slideNode") {
            const slideNode = node as SlideNode; // Cast
            const currentLayers = slideNode.data.layers || [];
            const newLayerId = `${nodeId}-layer-${Date.now()}`; // Simple unique ID
            let newLayer: Layer;

            // Define default properties based on layer type
            const defaultStyle: React.CSSProperties = {
              top: "50px",
              left: "50px",
              width: "150px",
              height: "80px",
              zIndex:
                (currentLayers.length > 0
                  ? Math.max(
                      ...currentLayers.map((l) =>
                        typeof l.style?.zIndex === "number" ? l.style.zIndex : 0
                      )
                    )
                  : 0) + 1,
            };

            switch (layerType) {
              case "text":
                newLayer = {
                  id: newLayerId,
                  type: "text",
                  name: "新文本",
                  content: "输入文本...",
                  style: defaultStyle,
                  textFormat: { fontSize: "16px" },
                };
                break;
              case "media": // Default to image
                newLayer = {
                  id: newLayerId,
                  type: "media",
                  name: "新图片",
                  mediaType: "image",
                  url: "",
                  style: {
                    ...defaultStyle,
                    width: "200px",
                    height: "150px",
                    backgroundColor: "#eee",
                  },
                  altText: "新图片",
                };
                break;
              default:
                console.warn(`Unsupported layer type for adding: ${layerType}`);
                return node; // Return unchanged if type is unsupported
            }

            // Return updated node with new layer added
            return {
              ...slideNode,
              data: { ...slideNode.data, layers: [...currentLayers, newLayer] },
            };
          }
          return node; // Return other nodes unchanged
        })
      );
      // Optionally select the new layer after adding it
      // setSelectedLayerId(newLayerId);
    },
    [setNodes]
  ); // Dependency is correct

  return (
    <div
      className={`app-container ${
        isLayerPanelVisible || isPropertiesPanelVisible ? "panels-visible" : ""
      }`}
    >
      <LayerPanel
        isVisible={isLayerPanelVisible}
        selectedNode={selectedNode} // Pass the derived SlideNode | null
        // Remove setSelectedNode prop as LayerPanel only deals with layers now
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId} // Pass the correct setter
        addLayer={addLayer}
        // Pass panel visibility setters
        setIsLayerPanelVisible={setIsLayerPanelVisible}
        setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
      />
      {/* Pass all state and handlers down to FlowCanvas */}
      <FlowCanvas
        nodes={nodes} // Pass Node<NodeData>[]
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onNodeSelect={handleNodeSelect}
        onCanvasClick={handleCanvasClick}
        isPropertiesPanelVisible={isPropertiesPanelVisible}
        selectedNode={selectedNode} // Pass the derived SlideNode | null
        selectedLayerId={selectedLayerId}
        updateLayerData={updateLayerData}
        deleteNode={deleteNode}
        deleteLayer={deleteLayer} // Pass deleteLayer down
        addSlideNode={addSlideNode}
        handleAutoLayout={handleAutoLayout}
        handleExport={handleExport}
        handleClearStorage={handleClearStorage} // Pass clear function
        isLayerPanelVisible={isLayerPanelVisible}
        // Pass panel visibility setters down to FlowCanvas
        setIsLayerPanelVisible={setIsLayerPanelVisible}
        setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
        setSelectedLayerId={setSelectedLayerId} // Pass the correct setter here
      />
    </div>
  );
};

// Wrap AppContent with ReactFlowProvider
function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
