import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  // ReactFlowProvider, // Removed unused import
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow";

import Toolbar from "./Toolbar";
import EditorArea from "./EditorArea";
import PropertiesPanel from "./PropertiesPanel";

// Import types and utils
import { NodeData, SlideNode, Theme } from "../types"; // Import Theme type
import {
  loadInitialState,
  saveNodesToStorage,
  saveEdgesToStorage,
} from "../utils/storageUtils";
import { getNodesInOrder, applyAutoLayout } from "../utils/nodeUtils";
import { exportPresentation as exportPresentationUtil } from "../utils/exportUtils";
import SettingsButton from "./SettingsButton"; // Import SettingsButton

// Define props for FlowCanvas
interface FlowCanvasProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

// --- FlowCanvas Component ---
function FlowCanvas({ currentTheme, onThemeChange }: FlowCanvasProps) { // Destructure props
  const { initialNodes, initialEdges } = loadInitialState();
  const [nodes, setNodes, onNodesChange] =
    useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<SlideNode | null>(null);
  const reactFlowInstance = useReactFlow<NodeData>();
  const flowWrapperRef = useRef<HTMLDivElement>(null); // Ref for the container
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 }); // State for viewport dimensions

  // --- Get Viewport Dimensions ---
  useEffect(() => {
    const currentRef = flowWrapperRef.current; // Capture ref value

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use const instead of let
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (currentRef) {
      resizeObserver.observe(currentRef);
      // Initial size
      setViewportSize({
        width: currentRef.clientWidth,
        height: currentRef.clientHeight,
      });
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef); // Cleanup observer on unmount
      }
    };
  }, []); // Run only once on mount

  // --- State Persistence ---
  useEffect(() => {
    saveNodesToStorage(nodes);
  }, [nodes]);

  useEffect(() => {
    saveEdgesToStorage(edges);
  }, [edges]);

  // --- Callbacks ---
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as SlideNode);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addSlideNode = useCallback(() => {
    const existingIds = nodes
      .map((n) => parseInt(n.id, 10))
      .filter((id) => !isNaN(id));
    const nextIdNumber =
      existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newNodeId = nextIdNumber.toString();

    const newNode: SlideNode = {
      id: newNodeId,
      type: "slideNode",
      data: {
        label: `PPT 页面 ${newNodeId}`,
        content1: "新页面的内容...",
        layout: "title_content",
      },
      position: {
        x: 150,
        y:
          nodes.length > 0
            ? Math.max(...nodes.map((n) => n.position.y)) + 230
            : 100,
      },
    };
    setNodes((nds) => nds.concat(newNode));

    // Focus on the new node
    setTimeout(() => {
      reactFlowInstance.setCenter(
        newNode.position.x + 160,
        newNode.position.y + 90,
        { zoom: 1, duration: 300 }
      );
    }, 50);
  }, [nodes, setNodes, reactFlowInstance]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const currentData = node.data || {};
            return { ...node, data: { ...currentData, ...newData } };
          }
          return node;
        })
      );
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...(prev.data || {}), ...newData } } : null
        );
      }
    },
    [selectedNode, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleAutoLayout = useCallback(() => {
    const orderedNodes = getNodesInOrder(nodes, edges);
    const layoutedNodes = applyAutoLayout(orderedNodes);
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  const handleExport = useCallback(() => {
    exportPresentationUtil(nodes, edges);
  }, [nodes, edges]);

  // --- Render ---
  return (
    <>
      {" "}
      {/* Use Fragment as the outer container is now App.tsx's div */}
      <Toolbar
        addSlide={addSlideNode}
        exportToPptx={handleExport}
        onAutoLayout={handleAutoLayout}
      />
      {/* Add ref to the EditorArea container */}
      <div ref={flowWrapperRef} style={{ width: "100%", height: "100%" }}>
        <EditorArea
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          isPanelVisible={selectedNode !== null}
          selectedNode={selectedNode} // Pass selectedNode state
          viewportSize={viewportSize} // Pass viewport size down
        />
      </div>
      {/* Pass theme props down to SettingsButton */}
      <SettingsButton currentTheme={currentTheme} onThemeChange={onThemeChange} />
      {/* Properties Panel with conditional visibility */}
      <div
        className={`properties-panel-container ${
          selectedNode ? "visible" : ""
        }`}
      >
        <PropertiesPanel
          selectedNode={selectedNode}
          updateNodeData={updateNodeData}
          deleteNode={deleteNode}
        />
      </div>
    </>
  );
}

// Export FlowCanvas component
export default FlowCanvas;
