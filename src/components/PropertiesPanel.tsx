import React, { useState, useEffect, ChangeEvent } from "react";
// import { Node } from "reactflow"; // Removed unused import
import { NodeData, SlideLayout, SlideNode } from "../types"; // Import from types.ts

// Define the props type
interface PropertiesPanelProps {
  selectedNode: SlideNode | null; // Use SlideNode type
  updateNodeData: (nodeId: string, newData: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void; // Add deleteNode prop type
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  updateNodeData,
  deleteNode, // Destructure deleteNode prop
}) => {
  // Local state to manage form inputs, synced with selectedNode
  const [labelText, setLabelText] = useState("");
  const [layout, setLayout] = useState(""); // Add state for layout
  const [content1Value, setContent1Value] = useState(""); // Renamed state for first content area
  const [content2Value, setContent2Value] = useState(""); // Add state for second content area
  const [content3Value, setContent3Value] = useState(""); // Add state for third content area
  const [content4Value, setContent4Value] = useState(""); // Add state for fourth content area
  // Add more states for other properties like color etc.
  // const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  // Effect to update local state when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setLabelText(selectedNode.data?.label || "");
      setLayout(selectedNode.data?.layout || "title_content"); // Sync layout state
      setContent1Value(selectedNode.data?.content1 || ""); // Sync content1 state
      setContent2Value(selectedNode.data?.content2 || ""); // Sync content2 state
      setContent3Value(selectedNode.data?.content3 || ""); // Sync content3 state
      setContent4Value(selectedNode.data?.content4 || ""); // Sync content4 state
      // setBackgroundColor(selectedNode.data?.backgroundColor || '#ffffff');
    } else {
      // Reset when no node is selected
      setLabelText("");
      setLayout(""); // Reset layout state
      setContent1Value(""); // Reset content1 state
      setContent2Value(""); // Reset content2 state
      setContent3Value(""); // Reset content3 state
      setContent4Value(""); // Reset content4 state
      // setBackgroundColor('#ffffff');
    }
  }, [selectedNode]);

  // Handle input changes and call updateNodeData to sync with App state
  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLabel = event.target.value;
    setLabelText(newLabel);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { label: newLabel });
    }
  };

  // const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const newColor = event.target.value;
  //   setBackgroundColor(newColor);
  //   if (selectedNode) {
  //     updateNodeData(selectedNode.id, { backgroundColor: newColor });
  //     // You might also need to update the node style directly for visual feedback
  //     // This often requires more complex state management or direct access to React Flow instance
  //   }
  // };

  // Handle layout changes
  const handleLayoutChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLayout = event.target.value;
    setLayout(newLayout);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { layout: newLayout as SlideLayout }); // Cast to SlideLayout
    }
  };

  // Handle content1 changes
  const handleContent1Change = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent1Value(newContent);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { content1: newContent });
    }
  };

  // Handle content2 changes
  const handleContent2Change = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent2Value(newContent);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { content2: newContent });
    }
  };

  // Handle content3 changes
  const handleContent3Change = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent3Value(newContent);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { content3: newContent });
    }
  };

  // Handle content4 changes
  const handleContent4Change = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent4Value(newContent);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { content4: newContent });
    }
  };
  // Return content directly, container div is now in App.tsx
  return (
    <>
      <h3 className="properties-panel-title">属性编辑</h3>
      {selectedNode ? (
        <div>
          <div className="property-group">
            <label htmlFor="nodeLabel">页面标题:</label>
            <input
              type="text"
              id="nodeLabel"
              value={labelText}
              onChange={handleLabelChange}
            />
          </div>

          {/* Example for Background Color (requires more setup for visual update) */}
          {/* <div className="property-group">
            <label htmlFor="nodeBgColor">背景颜色:</label>
            <input
              type="color"
              id="nodeBgColor"
              value={backgroundColor}
              onChange={handleColorChange}
            />
          </div> */}

          <div className="property-group">
            <label htmlFor="nodeLayout">布局:</label>
            <select
              id="nodeLayout"
              value={layout}
              onChange={handleLayoutChange}
            >
              <option value="title_content">标题+内容</option>
              <option value="title_only">仅标题</option>
              <option value="blank">空白</option>
              <option value="title_two_content_vertical">
                标题+双内容(垂直)
              </option>
              <option value="title_two_content_horizontal">
                标题+双内容(水平)
              </option>
              <option value="title_four_content_grid">标题+4内容(网格)</option>
              <option value="title_four_content_horizontal">
                标题+4内容(水平)
              </option>
            </select>
          </div>

          <div className="property-group">
            {/* Content Area 1 */}
            {/* Content Area 1 */}
            {(layout === "title_content" ||
              layout === "title_two_content_vertical" ||
              layout === "title_two_content_horizontal" ||
              layout === "title_four_content_grid" ||
              layout === "title_four_content_horizontal") && (
              <div className="property-group" style={{ marginBottom: "10px" }}>
                <label htmlFor="nodeContent1">
                  {layout === "title_content" ? "内容:" : "内容 1:"}
                </label>
                <textarea
                  id="nodeContent1"
                  placeholder="编辑内容区域 1..."
                  value={content1Value}
                  onChange={handleContent1Change}
                  rows={
                    layout === "title_four_content_grid" ||
                    layout === "title_four_content_horizontal"
                      ? 2
                      : layout === "title_two_content_horizontal"
                      ? 5
                      : 3
                  }
                ></textarea>
              </div>
            )}
            {/* Content Area 2 */}
            {/* Content Area 2 */}
            {(layout === "title_two_content_vertical" ||
              layout === "title_two_content_horizontal" ||
              layout === "title_four_content_grid" ||
              layout === "title_four_content_horizontal") && (
              <div className="property-group" style={{ marginBottom: "10px" }}>
                <label htmlFor="nodeContent2">内容 2:</label>
                <textarea
                  id="nodeContent2"
                  placeholder="编辑内容区域 2..."
                  value={content2Value}
                  onChange={handleContent2Change}
                  rows={
                    layout === "title_four_content_grid" ||
                    layout === "title_four_content_horizontal"
                      ? 2
                      : layout === "title_two_content_horizontal"
                      ? 5
                      : 3
                  }
                ></textarea>
              </div>
            )}
            {/* Content Area 3 */}
            {/* Content Area 3 */}
            {(layout === "title_four_content_grid" ||
              layout === "title_four_content_horizontal") && (
              <div className="property-group" style={{ marginBottom: "10px" }}>
                <label htmlFor="nodeContent3">内容 3:</label>
                <textarea
                  id="nodeContent3"
                  placeholder="编辑内容区域 3..."
                  value={content3Value}
                  onChange={handleContent3Change}
                  rows={2}
                ></textarea>
              </div>
            )}
            {/* Content Area 4 */}
            {/* Content Area 4 */}
            {(layout === "title_four_content_grid" ||
              layout === "title_four_content_horizontal") && (
              <div className="property-group">
                <label htmlFor="nodeContent4">内容 4:</label>
                <textarea
                  id="nodeContent4"
                  placeholder="编辑内容区域 4..."
                  value={content4Value}
                  onChange={handleContent4Change}
                  rows={2}
                ></textarea>
              </div>
            )}
          </div>

          {/* Add more property editors here */}
          <p style={{ fontSize: "0.8em", color: "#777" }}>
            ID: {selectedNode.id}
          </p>

          {/* Delete Button */}
          <button
            onClick={() => deleteNode(selectedNode.id)}
            style={{
              marginTop: "20px",
              padding: "8px 15px",
              backgroundColor: "#dc3545", // Red color for delete
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontSize: "0.9em",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#c82333")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc3545")
            }
          >
            删除此页面
          </button>
        </div>
      ) : (
        <p style={{ color: "#777", textAlign: "center", marginTop: "30px" }}>
          请在编辑区选中一个页面进行编辑
        </p>
      )}
    </>
  );
};

export default PropertiesPanel;
