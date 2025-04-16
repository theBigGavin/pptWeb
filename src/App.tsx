import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"; // Add useRef
import AspectRatioModal from "./components/AspectRatioModal"; // Import the modal
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
import FullscreenPresenter from "./components/FullscreenPresenter"; // Import the presenter
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
import "./styles/AspectRatioModal.css"; // Import modal styles
import "./styles/FullscreenPresenter.css"; // Import presenter styles

const THEME_STORAGE_KEY = "pptweb-theme";
const ASPECT_RATIO_STORAGE_KEY = "pptweb-aspect-ratio"; // Key for storing aspect ratio

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
  const [isAspectRatioModalOpen, setIsAspectRatioModalOpen] = useState(false); // State for modal visibility
  const [lastUsedAspectRatio, setLastUsedAspectRatio] = useState<string | null>(() => {
    // Initialize from localStorage or default to null
    return localStorage.getItem(ASPECT_RATIO_STORAGE_KEY) || null;
  });
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen mode
  const [isPreviewActive, setIsPreviewActive] = useState(false); // State for presentation mode active
  const appContainerRef = useRef<HTMLDivElement>(null); // Ref for the main container

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

  // --- Fullscreen Handling ---
  const toggleFullscreen = useCallback(() => {
    if (!appContainerRef.current) return;

    if (!document.fullscreenElement) {
      appContainerRef.current.requestFullscreen()
        .then(() => {
          setIsPreviewActive(true); // Activate preview on successful fullscreen entry
        })
        .catch((err) => {
          alert(`无法进入全屏模式: ${err.message} (${err.name})`);
          setIsPreviewActive(false); // Ensure preview is not active if fullscreen fails
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
             setIsPreviewActive(false); // Deactivate preview on successful exit
          })
          .catch((err) => {
             console.error("Error exiting fullscreen:", err);
             // Handle potential errors if needed, but still deactivate preview
             setIsPreviewActive(false);
          });
      } else {
         setIsPreviewActive(false); // Deactivate if exit function doesn't exist
      }
    }
  }, []); // Dependencies are correct

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setIsPreviewActive(false); // Deactivate preview if fullscreen is exited (e.g., by ESC key)
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Also listen for vendor-prefixed versions if needed, though less common now
    // document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    // document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    // document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      // document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      // document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      // document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);


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

  // Modified addSlideNode to accept aspectRatio
  const addSlideNode = useCallback(
    (aspectRatio: string) => {
      console.log("[addSlideNode] Received aspectRatio:", aspectRatio); // Log received ratio
      const existingIds = nodes
        .map((n) => parseInt(n.id, 10))
        .filter((id) => !isNaN(id));
      const nextIdNumber =
        existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const newNodeId = nextIdNumber.toString();

      const baseWidth = 600; // Increase base width for larger nodes

      // Ensure the new node conforms to Node<NodeData> but has SlideNode structure in data
      const newNode: SlideNode = {
        id: newNodeId,
        type: "slideNode", // Ensure this matches the registered node type
        data: {
          label: `PPT 页面 ${newNodeId}`,
          // Also pass width/height in data for the node component to use directly
          width: baseWidth,
          height: (() => {
            let calculatedHeight: number;
            if (aspectRatio === "4:3") {
              calculatedHeight = baseWidth * (3 / 4); // 450
            } else {
              calculatedHeight = baseWidth * (9 / 16); // 337.5
            }
            return calculatedHeight;
          })(),
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
                top: "10px",
                left: "20px",
                width: "560px",
                height: "40px",
                zIndex: 1,
                fontSize: "24px",
                fontWeight: "bold",
                color: "RGB(255, 0, 0)",
                alignSelf: "center",
              },
              textFormat: { textAlign: "left" },
            },
            {
              id: `${newNodeId}-title-line`,
              type: "text",
              name: "line",
              content: "",
              style: {
                top: "54px",
                left: "0px",
                width: "600px",
                height: "1px",
                zIndex: 2,
                backgroundColor: "RGB(255, 0, 0)",
                alignSelf: "center",
              },
              textFormat: { textAlign: "left" },
            },
          ],
        },
        // Calculate position based on existing nodes
        position: {
          x: (() => {
            if (nodes.length === 0) {
              return 150; // Initial X position if no nodes exist
            }
            // Find the node with the maximum x position
            const rightmostNode = nodes.reduce((prev, current) => {
              return (prev.position.x > current.position.x) ? prev : current;
            });
            // Calculate new x based on rightmost node's position and width + margin
            const rightmostNodeWidth = rightmostNode.width ?? 600; // Use actual width or fallback matching baseWidth
            const margin = 80; // Horizontal margin between nodes
            return rightmostNode.position.x + rightmostNodeWidth + margin;
          })(),
          y: 100, // Fixed Y position for horizontal layout
        },
        // Calculate width/height based on aspectRatio explicitly
        width: baseWidth, // Now 600
        height: (aspectRatio === "4:3") ? (baseWidth * (3 / 4)) : (baseWidth * (9 / 16)), // 450 for 4:3, 337.5 for 16:9
      };
      // Log the final dimensions being set on the node object
      console.log(`[addSlideNode] Setting newNode dimensions: width=${newNode.width}, height=${newNode.height}`);
      console.log("[addSlideNode] newNode object created:", JSON.stringify(newNode, null, 2)); // Log the entire newNode object
      setNodes((nds) => nds.concat(newNode));

      // Focus using reactFlowInstance
      setTimeout(() => {
        // Use the actual calculated dimensions
        const nodeWidth = newNode.width;
        const nodeHeight = newNode.height;
        // Log the dimensions used for centering
        console.log(`[addSlideNode Focus] Using dimensions for center: width=${nodeWidth}, height=${nodeHeight}`);
        // Ensure width/height are valid numbers before calculating center
        if (typeof nodeWidth === 'number' && typeof nodeHeight === 'number' && nodeWidth > 0 && nodeHeight > 0) { // Add check for > 0
          reactFlowInstance?.setCenter(
            newNode.position.x + nodeWidth / 2,
            newNode.position.y + nodeHeight / 2,
            { zoom: 1, duration: 300 }
          );
        } else {
          console.error("[addSlideNode Focus] Calculated node dimensions are invalid or zero:", nodeWidth, nodeHeight);
          // Optionally fallback to a default center or fitView if dimensions are bad
          reactFlowInstance?.fitView({ duration: 300 });
        }
      }, 50);
    },
    [nodes, setNodes, reactFlowInstance]
  ); // Dependencies are correct

  // Handler to open the aspect ratio modal OR add directly if ratio is known
  const handleAddSlideClick = useCallback(() => {
    if (nodes.length === 0 || !lastUsedAspectRatio) {
      // If no nodes exist yet, or no ratio was ever selected, show modal
      setIsAspectRatioModalOpen(true);
    } else {
      // Otherwise, add node directly with the last used ratio
      addSlideNode(lastUsedAspectRatio);
    }
  }, [nodes, lastUsedAspectRatio, addSlideNode]); // Add dependencies

  // Handler for when an aspect ratio is selected in the modal
  const handleAspectRatioSelect = useCallback(
    (aspectRatio: string) => {
      addSlideNode(aspectRatio); // Call the modified addSlideNode
      setLastUsedAspectRatio(aspectRatio); // Store the selected ratio in state
      localStorage.setItem(ASPECT_RATIO_STORAGE_KEY, aspectRatio); // Store in localStorage
      setIsAspectRatioModalOpen(false); // Close the modal
    },
    [addSlideNode, setLastUsedAspectRatio] // Add dependencies
  );

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
      localStorage.removeItem(ASPECT_RATIO_STORAGE_KEY); // Also clear the aspect ratio cache
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
              color: "#000", // Default text color to black
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
    // Add ref and fullscreen class handling
    <div
      ref={appContainerRef}
      className={`app-container ${
        isLayerPanelVisible || isPropertiesPanelVisible ? "panels-visible" : ""
      } ${isFullscreen ? "fullscreen-active" : ""}`} // Add fullscreen class
    >
      {/* Render presenter if preview is active, otherwise render normal UI */}
      {isPreviewActive && isFullscreen ? (
        <FullscreenPresenter
          nodes={nodes as SlideNode[]} // Pass nodes (cast if necessary)
          onExit={toggleFullscreen} // Use toggleFullscreen to exit
          // Pass other necessary props later
        />
      ) : (
        <>
          {/* Render normal UI only when not in preview */}
          <LayerPanel
            isVisible={isLayerPanelVisible}
            selectedNode={selectedNode} // Pass the derived SlideNode | null
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId} // Pass the correct setter
            addLayer={addLayer} // Pass addLayer only to LayerPanel
            // Pass panel visibility setters
            setIsLayerPanelVisible={setIsLayerPanelVisible}
            setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
          />
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
            // addSlideNode={addSlideNode} // Replace with handleAddSlideClick
            handleAddSlideClick={handleAddSlideClick} // Pass the modal opener handler
            handleAutoLayout={handleAutoLayout}
            handleExport={handleExport}
            handleClearStorage={handleClearStorage} // Pass clear function
            isLayerPanelVisible={isLayerPanelVisible}
            // Pass panel visibility setters down to FlowCanvas
            setIsLayerPanelVisible={setIsLayerPanelVisible}
            setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
            setSelectedLayerId={setSelectedLayerId} // Pass the correct setter here
            toggleFullscreen={toggleFullscreen} // Pass fullscreen toggle function
            isFullscreen={isFullscreen} // Pass fullscreen state
          />
          <AspectRatioModal
            isOpen={isAspectRatioModalOpen}
            onClose={() => setIsAspectRatioModalOpen(false)}
            onSelect={handleAspectRatioSelect}
          />
        </>
      )}
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
