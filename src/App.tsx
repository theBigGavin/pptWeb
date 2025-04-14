import React, { useState, useCallback } from 'react';
import PptxGenJS from 'pptxgenjs'; // Import pptxgenjs
import ReactFlow, {
  ReactFlowProvider, // Needed for hooks like useReactFlow
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
  Background, // Optional: Adds a background pattern
  Controls    // Optional: Adds zoom/pan controls
} from 'reactflow';

import Toolbar from './components/Toolbar';
import EditorArea from './components/EditorArea';
import PropertiesPanel from './components/PropertiesPanel';
import './styles/main.css'; // Ensure App styles are loaded

// Initial setup (can be expanded)
const initialNodes: Node[] = [
  { id: '1', type: 'slideNode', data: { label: 'PPT 页面 1', contentPreview: '这是第一页的内容预览...' }, position: { x: 100, y: 100 } }, // Use slideNode type and add preview data
];
const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Handle node selection to update the properties panel
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

   // Handle pane click to deselect node
   const handlePaneClick = useCallback(() => {
       setSelectedNode(null);
   }, []);

  // Function to add a new node (called from Toolbar)
  const addSlideNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newNodeId,
      type: 'slideNode', // Use the custom node type
      data: { label: `PPT 页面 ${newNodeId}`, contentPreview: '新页面的内容...' }, // Add preview data for new nodes
      position: {
        x: Math.random() * 400 + 50, // Random position for demo
        y: Math.random() * 200 + 50,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  // Function to update node data (called from PropertiesPanel)
   const updateNodeData = useCallback((nodeId: string, newData: any) => {
       setNodes((nds) =>
           nds.map((node) => {
               if (node.id === nodeId) {
                   // Merge new data with existing data
                   return { ...node, data: { ...node.data, ...newData } };
               }
               return node;
           })
       );
       // Also update the selected node state if it's the one being edited
       if (selectedNode && selectedNode.id === nodeId) {
           setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
       }
   }, [selectedNode, setNodes]);


  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Function to export the presentation
  const exportPresentation = useCallback(() => {
    if (nodes.length === 0) {
      alert('没有可导出的页面！');
      return;
    }

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9'; // Set layout

    // Sort nodes based on Y position (simple top-to-bottom ordering)
    // A more robust solution might involve tracking connections or explicit order
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

    sortedNodes.forEach((node) => {
      const slide = pptx.addSlide();
      const title = node.data?.label || '无标题';
      const content = node.data?.contentPreview || ''; // Use contentPreview for now

      // Add title (adjust position and options as needed)
      slide.addText(title, {
        x: 0.5, y: 0.25, w: '90%', h: 0.75,
        fontSize: 24, bold: true, align: 'center',
      });

      // Add content (adjust position and options as needed)
       if (content) {
           slide.addText(content, {
               x: 0.5, y: 1.2, w: '90%', h: '75%',
               fontSize: 14, align: 'left',
           });
       }

      // Add more elements based on node data if available (e.g., images, shapes)
    });

    pptx.writeFile({ fileName: 'MyPresentation.pptx' })
      .then(() => console.log('Presentation exported'))
      .catch(err => console.error('Error exporting presentation:', err));

  }, [nodes]); // Dependency on nodes state

  return (
    // ReactFlowProvider is essential for hooks like useReactFlow to work within child components
    <ReactFlowProvider>
      <div className="app-container">
        <Toolbar addSlide={addSlideNode} exportToPptx={exportPresentation} /> {/* Pass the export function */}
        <EditorArea
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
        />
        <PropertiesPanel selectedNode={selectedNode} updateNodeData={updateNodeData} />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
