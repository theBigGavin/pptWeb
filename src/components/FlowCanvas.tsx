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
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onNodeSelect: NodeMouseHandler; // Correct signature
  onCanvasClick: () => void;
  isPropertiesPanelVisible: boolean;
  selectedNode: SlideNode | null;
  selectedLayerId: string | null;
  updateLayerData: (nodeId: string, layerId: string, newLayerData: Partial<Layer>) => void;
  deleteNode: (nodeId: string) => void;
  addSlideNode: () => void;
  handleAutoLayout: () => void;
  handleExport: () => void;
  isLayerPanelVisible: boolean;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>; // Add setter prop type
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
  addSlideNode,
  handleAutoLayout,
  handleExport,
  isLayerPanelVisible,
  setSelectedLayerId, // Destructure the setter
}: FlowCanvasProps) {

  // --- Prepare Nodes with Extra Data ---
  // Inject necessary functions and state into each node's data prop for SlideNode component
  const nodesWithData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      // Ensure data exists, even if minimal
      data: {
        ...(node.data || { label: '', layers: [] }), // Spread existing data or provide default
        updateLayerData: updateLayerData,
        setSelectedLayerId: setSelectedLayerId, // Pass the setter from App
        nodeId: node.id, // Pass the node's own ID
        selectedLayerId: selectedLayerId, // Pass the currently selected layer ID
      }, // Remove the explicit type assertion here
    }));
  }, [nodes, updateLayerData, setSelectedLayerId, selectedLayerId]); // Ensure setter is in dependencies

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
    setViewportSize({ width: currentRef.clientWidth, height: currentRef.clientHeight }); // Initial size

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
        addSlide={addSlideNode}
        exportToPptx={handleExport}
        onAutoLayout={handleAutoLayout}
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
        />
      </div>
    </>
  );
}

export default FlowCanvas;
