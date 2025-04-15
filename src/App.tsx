import React, { useState, useEffect, useCallback, useMemo } from "react";
// Import necessary hooks and types from reactflow
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  // Node, // Keep Node type - Removed unused
  useReactFlow, // Keep for fitView etc.
  // NodeChange, // Import NodeChange type - Removed unused
  // EdgeChange, // Import EdgeChange type - Removed unused
  // OnNodesChange, // Import OnNodesChange type - Removed unused
  // OnEdgesChange, // Import OnEdgesChange type - Removed unused
  NodeMouseHandler, // Import NodeMouseHandler type
} from "reactflow";

import FlowCanvas from "./components/FlowCanvas";
import LayerPanel from "./components/LayerPanel";
// Import all needed types from types.ts
import { SlideNode, Layer, NodeData, Theme, TextLayer, TitleLayer, FooterLayer, LayerType } from "./types"; // Ensure LayerType is imported
import { loadInitialState, saveNodesToStorage, saveEdgesToStorage } from "./utils/storageUtils"; // Import storage utils
import { getNodesInOrder, applyAutoLayout } from "./utils/nodeUtils"; // Import node utils
import { exportPresentation as exportPresentationUtil } from "./utils/exportUtils"; // Import export utils
import "./styles/main.css";

const THEME_STORAGE_KEY = 'pptweb-theme';

// Wrap App content to use useReactFlow hook
const AppContent: React.FC = () => {
  // --- Load Initial State ---
  const { initialNodes, initialEdges } = loadInitialState();

  // --- Core React Flow State (Lifted) ---
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow<NodeData>(); // Get instance for fitView etc.

  // --- UI State ---
  const [isLayerPanelVisible, setIsLayerPanelVisible] = useState(false);
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] = useState(false);
  // Store only the ID of the selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null); // Correct state setter

  // Derive selectedNode object from state
  const selectedNode = useMemo(() => {
      if (!selectedNodeId) return null;
      // Ensure the found node is treated as SlideNode
      return (nodes.find(n => n.id === selectedNodeId) as SlideNode | undefined) || null;
  }, [nodes, selectedNodeId]);


  // --- Theme State Management ---
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (storedTheme as Theme) || 'system';
  });

  const applyTheme = useCallback((selectedTheme: Theme) => {
    let effectiveTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // console.log("System theme changed, reapplying..."); // Optional logging
      applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // --- State Persistence (Lifted) ---
   useEffect(() => {
     saveNodesToStorage(nodes);
   }, [nodes]);

   useEffect(() => {
     saveEdgesToStorage(edges);
   }, [edges]);

  // --- Panel Visibility Handlers ---
  // Use NodeMouseHandler type for consistency
  const handleNodeSelect: NodeMouseHandler = useCallback((_event, node) => {
    setIsLayerPanelVisible(true);
    setIsPropertiesPanelVisible(true);
    setSelectedNodeId(node.id); // Store the ID
    setSelectedLayerId(null); // Reset layer selection
  }, [setSelectedNodeId, setSelectedLayerId]);

  const handleCanvasClick = useCallback(() => {
    setIsLayerPanelVisible(false);
    setIsPropertiesPanelVisible(false);
    setSelectedNodeId(null); // Deselect node
    setSelectedLayerId(null); // Deselect layer
  }, [setSelectedNodeId, setSelectedLayerId]);

  // Handler to update theme state
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  // --- End Theme State Management ---

  // --- Layer Data Update Handler (Implemented with setNodes) ---
  const updateLayerData = useCallback((nodeId: string, layerId: string, newLayerData: Partial<Layer>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Ensure node.data and node.data.layers exist
          const currentData = node.data || { label: '', layers: [] };
          const currentLayers = currentData.layers || [];

          const updatedLayers = currentLayers.map((layer): Layer => { // Add return type annotation
            if (layer.id === layerId) {
              // Create a base updated layer
              let updatedLayer = { ...layer, ...newLayerData };

              // Deep merge style
              if (newLayerData.style) {
                updatedLayer.style = { ...(layer.style || {}), ...newLayerData.style };
              }

              // Deep merge textFormat only if the layer type supports it AND new data provides it
              if (
                (layer.type === 'text' || layer.type === 'title' || layer.type === 'footer') &&
                'textFormat' in newLayerData && newLayerData.textFormat // Check if new data has textFormat
              ) {
                 // Type assertion to access textFormat safely
                 const currentTextLayer = layer as TextLayer | TitleLayer | FooterLayer;
                 const currentTextFormat = currentTextLayer.textFormat || {};
                 // Ensure updatedLayer is also treated as having textFormat
                 (updatedLayer as TextLayer | TitleLayer | FooterLayer).textFormat = {
                     ...currentTextFormat,
                     ...newLayerData.textFormat,
                 };
              }
              // Add similar checks for other deep-merge properties (e.g., tableStyle) if needed

              return updatedLayer as Layer; // Assert final type
            }
            return layer;
          });
          return { ...node, data: { ...currentData, layers: updatedLayers } };
        }
        return node;
      })
    );
     // No need to update selectedNode state directly here,
     // useMemo will derive the updated selectedNode object when nodes array changes.
  }, [setNodes]);

  // --- Node/Edge Operations (Lifted) ---
   const onConnect = useCallback(
     (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
     [setEdges]
   );

   const addSlideNode = useCallback(() => {
     const existingIds = nodes.map(n => parseInt(n.id, 10)).filter(id => !isNaN(id));
     const nextIdNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
     const newNodeId = nextIdNumber.toString();

     const newNode: SlideNode = {
       id: newNodeId,
       type: "slideNode", // Ensure this matches the registered node type
       data: {
         label: `PPT 页面 ${newNodeId}`,
         layers: [
           { id: `${newNodeId}-bg`, type: 'background', name: '背景', style: { backgroundColor: '#ffffff', width: '100%', height: '100%', zIndex: 0 } },
           { id: `${newNodeId}-title`, type: 'title', name: '标题', content: `标题 ${newNodeId}`, style: { top: '20px', left: '20px', width: 'calc(100% - 40px)', height: 'auto', zIndex: 1, fontSize: '24px', fontWeight: 'bold' }, textFormat: { textAlign: 'center' } },
         ],
       },
       // Calculate position based on existing nodes
       position: { x: 150, y: nodes.length > 0 ? Math.max(...nodes.map(n => n.position?.y ?? 0)) + 230 : 100 }, // Added nullish coalescing for position.y
     };
     setNodes((nds) => nds.concat(newNode));

     // Focus using reactFlowInstance
     setTimeout(() => {
        // Use default dimensions if node width/height are not available yet
        const nodeWidth = (newNode as any).width ?? 320;
        const nodeHeight = (newNode as any).height ?? 180;
        reactFlowInstance?.setCenter(newNode.position.x + nodeWidth / 2, newNode.position.y + nodeHeight / 2, { zoom: 1, duration: 300 });
     }, 50);
   }, [nodes, setNodes, reactFlowInstance]);

   const deleteNode = useCallback((nodeId: string) => {
     setNodes((nds) => nds.filter((node) => node.id !== nodeId));
     setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
     if (selectedNodeId === nodeId) {
         setSelectedNodeId(null); // Deselect if the deleted node was selected
         setSelectedLayerId(null);
     }
   }, [setNodes, setEdges, selectedNodeId, setSelectedNodeId, setSelectedLayerId]);

   const handleAutoLayout = useCallback(() => {
     const orderedNodes = getNodesInOrder(nodes, edges);
     const layoutedNodes = applyAutoLayout(orderedNodes);
     setNodes(layoutedNodes);
     // Optionally fit view after layout
     setTimeout(() => reactFlowInstance?.fitView({ duration: 300 }), 50);
   }, [nodes, edges, setNodes, reactFlowInstance]);

   const handleExport = useCallback(() => {
     exportPresentationUtil(nodes, edges);
   }, [nodes, edges]);

   // TODO: Implement addLayerToNode function (already implemented above)
   // TODO: Implement deleteLayer function

   const addLayer = useCallback((nodeId: string, layerType: LayerType) => {
       setNodes((nds) =>
           nds.map((node) => {
               if (node.id === nodeId) {
                   const currentLayers = node.data.layers || [];
                   const newLayerId = `${nodeId}-layer-${Date.now()}`; // Simple unique ID
                   let newLayer: Layer;

                   // Define default properties based on layer type
                   const defaultStyle: React.CSSProperties = {
                       top: '50px',
                       left: '50px',
                       width: '150px',
                       height: '80px',
                       zIndex: (currentLayers.length > 0 ? Math.max(...currentLayers.map(l => typeof l.style?.zIndex === 'number' ? l.style.zIndex : 0)) : 0) + 1,
                   };

                   switch (layerType) {
                       case 'text':
                           newLayer = { id: newLayerId, type: 'text', name: '新文本', content: '输入文本...', style: defaultStyle, textFormat: { fontSize: '16px' } };
                           break;
                       case 'media': // Default to image
                           newLayer = { id: newLayerId, type: 'media', name: '新图片', mediaType: 'image', url: '', style: { ...defaultStyle, width: '200px', height: '150px', backgroundColor: '#eee' }, altText: '新图片' };
                           break;
                       default:
                           console.warn(`Unsupported layer type for adding: ${layerType}`);
                           return node;
                   }

                   return { ...node, data: { ...node.data, layers: [...currentLayers, newLayer] } };
               }
               return node;
           })
       );
       // Optionally select the new layer after adding it
       // setSelectedLayerId(newLayerId);
   }, [setNodes]);

  return (
      <div className={`app-container ${isLayerPanelVisible || isPropertiesPanelVisible ? 'panels-visible' : ''}`}>
        <LayerPanel
          isVisible={isLayerPanelVisible}
          selectedNode={selectedNode}
          // Remove setSelectedNode prop as LayerPanel only deals with layers now
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId} // Pass the correct setter
          addLayer={addLayer}
        />
        {/* Pass all state and handlers down to FlowCanvas */}
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onNodeSelect={handleNodeSelect}
          onCanvasClick={handleCanvasClick}
          isPropertiesPanelVisible={isPropertiesPanelVisible}
          selectedNode={selectedNode}
          selectedLayerId={selectedLayerId}
          updateLayerData={updateLayerData}
          deleteNode={deleteNode}
          addSlideNode={addSlideNode}
          handleAutoLayout={handleAutoLayout}
          handleExport={handleExport}
          isLayerPanelVisible={isLayerPanelVisible}
          setSelectedLayerId={setSelectedLayerId} // Pass the correct setter here
        />
      </div>
  );
}

// Wrap AppContent with ReactFlowProvider
function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
