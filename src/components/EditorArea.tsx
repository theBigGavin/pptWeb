import React, { useMemo } from "react"; // Import useMemo
import ReactFlow, {
  Background,
  // Controls, // Default controls removed
  MiniMap, // Optional: Adds a minimap
  Node, // Keep Node type if needed elsewhere, or remove if unused
  Edge, // Keep Edge type if needed elsewhere, or remove if unused
  // Connection, // Removed unused import
  // NodeChange, // Removed unused import
  // EdgeChange, // Removed unused import
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseHandler, // Type for onNodeClick
  // PaneClickFunc type is deprecated, use React.MouseEventHandler or similar
} from "reactflow";
import SlideNodeComponent from "./nodes/SlideNode"; // Rename component import
import { SlideNode } from "../types";
import CustomControls from "./CustomControls"; // Import custom controls

// Define the props type
interface EditorAreaProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler; // Pass the handler down
  onPaneClick: React.MouseEventHandler<Element>;
  isPanelVisible: boolean;
  selectedNode: SlideNode | null;
  viewportSize: { width: number; height: number }; // Add viewportSize prop type
}

const EditorArea: React.FC<EditorAreaProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  isPanelVisible,
  selectedNode,
  viewportSize, // Destructure viewportSize
}) => {
  // Define the node types
  const nodeTypes = useMemo(() => ({ slideNode: SlideNodeComponent }), []); // Use renamed component import

  return (
    <div className="editor-area-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick} // Attach the click handler
        onPaneClick={onPaneClick} // Attach the pane click handler
        fitView // Automatically fits the view on load/nodes change
        attributionPosition="bottom-left" // Position React Flow attribution
        nodeTypes={nodeTypes} // Register the custom node type
      >
        <CustomControls
          selectedNode={selectedNode}
          viewportSize={viewportSize}
        />{" "}
        {/* Pass viewportSize */}
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          // position="bottom-left" // Removed position, defaults to bottom-right
          className={isPanelVisible ? "minimap-offset" : ""} // Add class conditionally
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default EditorArea;
