import React, { useMemo } from 'react'; // Import useMemo
import ReactFlow, {
  Background,
  Controls,
  MiniMap, // Optional: Adds a minimap
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseHandler, // Type for onNodeClick
  // PaneClickFunc type is deprecated, use React.MouseEventHandler or similar
} from 'reactflow';
import SlideNode from './nodes/SlideNode'; // Import the custom node

// Define the props type
interface EditorAreaProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler; // Pass the handler down
  onPaneClick: React.MouseEventHandler<Element>; // Correct type for onPaneClick
}

const EditorArea: React.FC<EditorAreaProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
}) => {
  // Define the node types
  const nodeTypes = useMemo(() => ({ slideNode: SlideNode }), []);

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
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default EditorArea;