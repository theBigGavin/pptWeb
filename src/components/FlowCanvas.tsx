import React, { useRef, useEffect, useState, useMemo } from "react"; // Import useMemo
import {
  Node,
  Edge,
  // Connection, // Removed unused
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseHandler,
  // Removed unused imports like useNodesState, useEdgesState, addEdge etc.
} from "reactflow";

import Toolbar from "./Toolbar";
import EditorArea from "./EditorArea";
import PropertiesPanel from "./PropertiesPanel";
import SettingsButton from "./SettingsButton";
// Import types
import { NodeData, SlideNode, Theme, Layer } from "../types";

// Define the props type - Now receives state and handlers from App.tsx
interface FlowCanvasProps {
  nodes: Node<NodeData>[]; // Use Node<NodeData>
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onNodeSelect: NodeMouseHandler; // Correct signature
  onCanvasClick: () => void;
  isPropertiesPanelVisible: boolean;
  selectedNode: SlideNode | null; // Keep SlideNode here as it's what PropertiesPanel expects
  selectedLayerId: string | null;
  updateLayerData: (
    nodeId: string,
    layerId: string,
    newLayerData: Partial<Layer>
  ) => void;
  deleteNode: (nodeId: string) => void;
  // addSlideNode: () => void; // Replaced by handleAddSlideClick
  handleAddSlideClick: () => void; // Add the new prop for opening the modal
  handleAutoLayout: () => void;
  handleExport: () => void;
  handleClearStorage: () => void; // Add clear storage handler prop
  isLayerPanelVisible: boolean;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>; // Add setter prop type
  // Add panel visibility setters
  setIsLayerPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPropertiesPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  deleteLayer: (nodeId: string, layerId: string) => void; // Add deleteLayer prop
  // Add fullscreen props
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

// --- FlowCanvas Component (Refactored) ---
function FlowCanvas({
  // Destructure all props received from App.tsx
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  currentTheme,
  onThemeChange,
  onNodeSelect,
  onCanvasClick,
  isPropertiesPanelVisible,
  selectedNode,
  selectedLayerId,
  updateLayerData,
  deleteNode,
  // addSlideNode, // Replaced by handleAddSlideClick
  handleAddSlideClick, // Destructure the new handler
  handleAutoLayout,
  handleExport,
  handleClearStorage, // Destructure clear storage handler
  isLayerPanelVisible,
  setSelectedLayerId, // Destructure the setter
  // Destructure panel visibility setters
  setIsLayerPanelVisible,
  setIsPropertiesPanelVisible,
  deleteLayer, // Destructure deleteLayer
  // Destructure fullscreen props
  toggleFullscreen,
  isFullscreen,
}: FlowCanvasProps) {
  // --- Prepare Nodes with Extra Data ---
  // Inject necessary functions and state into each node's data prop for SlideNode component
  const nodesWithData = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      // Ensure data exists, even if minimal
      data: {
        ...(node.data || { label: "", layers: [] }), // Spread existing data or provide default
        updateLayerData: updateLayerData,
        setSelectedLayerId: setSelectedLayerId, // Pass the setter from App
        nodeId: node.id, // Pass the node's own ID
        selectedLayerId: selectedLayerId, // Pass the currently selected layer ID
        // Pass panel visibility setters into node data
        setIsLayerPanelVisible: setIsLayerPanelVisible,
        setIsPropertiesPanelVisible: setIsPropertiesPanelVisible,
      },
    }));
  }, [
    nodes,
    updateLayerData,
    setSelectedLayerId,
    selectedLayerId,
    setIsLayerPanelVisible,
    setIsPropertiesPanelVisible,
  ]); // Add panel setters to dependencies

  // Keep viewport size logic if needed by EditorArea or Controls
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const currentRef = flowWrapperRef.current;
    if (!currentRef) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(currentRef);
    setViewportSize({
      width: currentRef.clientWidth,
      height: currentRef.clientHeight,
    }); // Initial size

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Remove all lifted state and callbacks:
  // - useNodesState, useEdgesState
  // - loadInitialState, saveNodesToStorage, saveEdgesToStorage
  // - local selectedNode state
  // - handleNodeClick, handlePaneClick (use onNodeSelect, onCanvasClick directly)
  // - addSlideNode, updateNodeData, deleteNode, handleAutoLayout, handleExport (use props)

  return (
    <>
      {/* Toolbar now receives actions from props */}
      <Toolbar
        // addSlide={addSlideNode} // Pass the new handler
        addSlide={handleAddSlideClick} // Pass the handler to open the modal
        exportToPptx={handleExport}
        onAutoLayout={handleAutoLayout}
        onClearStorage={handleClearStorage} // Pass clear storage handler
        onToggleFullscreen={toggleFullscreen} // Pass fullscreen toggle to Toolbar
      />
      <div ref={flowWrapperRef} style={{ width: "100%", height: "100%" }}>
        {/* EditorArea receives the modified nodes array */}
        <EditorArea
          nodes={nodesWithData} // Pass the enhanced nodes array
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeSelect} // Pass the handler directly
          onPaneClick={onCanvasClick} // Pass the handler directly
          isPanelVisible={isPropertiesPanelVisible} // Pass visibility for MiniMap offset
          selectedNode={selectedNode}
          viewportSize={viewportSize}
        />
      </div>
      <SettingsButton
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        isLayerPanelVisible={isLayerPanelVisible}
      />
      {/* Properties Panel container */}
      <div
        className={`properties-panel-container ${
          isPropertiesPanelVisible ? "visible" : ""
        }`}
      >
        {/* PropertiesPanel receives state and handlers from props */}
        <PropertiesPanel
          selectedNode={selectedNode}
          selectedLayerId={selectedLayerId}
          updateLayerData={updateLayerData}
          deleteNode={deleteNode}
          deleteLayer={deleteLayer} // Pass deleteLayer to PropertiesPanel
        />
      </div>
    </>
  );
}

export default FlowCanvas;
