import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

// Basic styling for the custom node directly in the component for simplicity
// In a larger app, these would likely be in a CSS file or styled-components
const nodeStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  padding: "10px", // Reduced padding
  fontSize: "10px", // Smaller base font size for preview
  width: 320, // Increased width for better preview
  height: 180, // Increased height (16:9 ratio)
  textAlign: "left",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start", // Align content to top
  position: "relative", // For handle positioning
  overflow: "hidden", // Hide overflowing content
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "1.1em", // Relative to nodeStyle font-size
  marginBottom: "5px",
  color: "#333",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap", // Prevent title wrapping in preview
  paddingRight: "5px", // Avoid overlapping with handles if title is long
};

const contentPreviewStyle: React.CSSProperties = {
  fontSize: "0.9em",
  color: "#666",
  overflow: "hidden",
  textOverflow: "ellipsis",
  // Simulating multiline clamp with line-height and max-height
  lineHeight: "1.3",
  maxHeight: "calc(1.3em * 3)", // Show max ~3 lines of content preview
  wordBreak: "break-word",
  whiteSpace: "pre-wrap", // Preserve line breaks and wrap text
};

// Define the type for the node data if needed (optional but good practice)
// interface SlideNodeData {
//   label: string;
//   contentPreview?: string; // Add other data properties as needed
// }

// Use memo to prevent unnecessary re-renders
const SlideNode: React.FC<NodeProps> = memo(({ data, isConnectable }) => {
  // Extract data, provide defaults
  const label = data?.label || "未命名页面";
  const content1 = data?.content1 || "内容 1..."; // Use content1 field
  const content2 = data?.content2 || "内容 2..."; // Use content2 field
  const content3 = data?.content3 || "内容 3..."; // Use content3 field
  const content4 = data?.content4 || "内容 4..."; // Use content4 field
  const layout = data?.layout || "title_content"; // Get layout, default to title_content

  return (
    <div style={nodeStyle}>
      {/* Input Handle (Top Center) */}
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        isConnectable={isConnectable}
        style={{ background: "#555", width: "8px", height: "8px" }}
      />
      {/* Node Content - Render based on layout */}
      {layout === "title_content" && (
        <>
          <div style={titleStyle}>{label}</div>
          <div style={contentPreviewStyle}>{content1}</div>
        </>
      )}
      {layout === "title_only" && (
        // Example: Center title vertically for title_only layout
        <div
          style={{
            ...titleStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {label}
        </div>
      )}
      {layout === "blank" && (
        // Example: Show placeholder for blank layout
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#aaa",
            fontSize: "0.9em",
          }}
        >
          (空白页面)
        </div>
      )}
      {/* Vertical Two Content Layout */}
      {layout === "title_two_content_vertical" && (
        <>
          <div style={titleStyle}>{label}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 30px)",
              overflow: "hidden",
            }}
          >
            {" "}
            {/* Adjust height based on title */}
            <div
              style={{
                ...contentPreviewStyle,
                flex: 1,
                marginBottom: "5px",
                maxHeight: "45%",
              }}
            >
              {content1}
            </div>
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "45%" }}>
              {content2}
            </div>
          </div>
        </>
      )}
      {/* Horizontal Two Content Layout */}
      {layout === "title_two_content_horizontal" && (
        <>
          <div style={titleStyle}>{label}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              height: "calc(100% - 30px)",
              overflow: "hidden",
            }}
          >
            {" "}
            {/* Adjust height based on title */}
            <div
              style={{
                ...contentPreviewStyle,
                flex: 1,
                marginRight: "5px",
                maxHeight: "90%",
              }}
            >
              {content1}
            </div>
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "90%" }}>
              {content2}
            </div>
          </div>
        </>
      )}
      {/* Four Content Grid Layout */}
      {layout === "title_four_content_grid" && (
        <>
          <div style={titleStyle}>{label}</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: "5px",
              height: "calc(100% - 30px)",
              overflow: "hidden",
            }}
          >
            <div style={{ ...contentPreviewStyle, maxHeight: "95%" }}>
              {content1}
            </div>
            <div style={{ ...contentPreviewStyle, maxHeight: "95%" }}>
              {content2}
            </div>
            <div style={{ ...contentPreviewStyle, maxHeight: "95%" }}>
              {content3}
            </div>
            <div style={{ ...contentPreviewStyle, maxHeight: "95%" }}>
              {content4}
            </div>
          </div>
        </>
      )}
      {/* Four Content Horizontal Layout */}
      {layout === "title_four_content_horizontal" && (
        <>
          <div style={titleStyle}>{label}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
              height: "calc(100% - 30px)",
              overflow: "hidden",
            }}
          >
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "95%" }}>
              {content1}
            </div>
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "95%" }}>
              {content2}
            </div>
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "95%" }}>
              {content3}
            </div>
            <div style={{ ...contentPreviewStyle, flex: 1, maxHeight: "95%" }}>
              {content4}
            </div>
          </div>
        </>
      )}

      {/* Output Handle (Bottom Center) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
        style={{ background: "#555", width: "8px", height: "8px" }}
      />
      {/* Optional: Left/Right Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="l"
        isConnectable={isConnectable}
        style={{
          background: "#aaa",
          top: "50%",
          width: "6px",
          height: "10px",
          borderRadius: "2px",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        isConnectable={isConnectable}
        style={{
          background: "#aaa",
          top: "50%",
          width: "6px",
          height: "10px",
          borderRadius: "2px",
        }}
      />
    </div>
  );
});

SlideNode.displayName = "SlideNode"; // Add display name for better debugging

export default SlideNode;
