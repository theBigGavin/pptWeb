import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Basic styling for the custom node directly in the component for simplicity
// In a larger app, these would likely be in a CSS file or styled-components
const nodeStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '5px',
  padding: '10px', // Reduced padding
  fontSize: '10px', // Smaller base font size for preview
  width: 160, // Fixed width for preview consistency
  height: 90, // Fixed height (16:9 ratio)
  textAlign: 'left',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', // Align content to top
  position: 'relative', // For handle positioning
  overflow: 'hidden', // Hide overflowing content
};

const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '1.1em', // Relative to nodeStyle font-size
    marginBottom: '5px',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', // Prevent title wrapping in preview
    paddingRight: '5px', // Avoid overlapping with handles if title is long
};

const contentPreviewStyle: React.CSSProperties = {
    fontSize: '0.9em',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // Simulating multiline clamp with line-height and max-height
    lineHeight: '1.3',
    maxHeight: 'calc(1.3em * 3)', // Show max ~3 lines of content preview
    wordBreak: 'break-word',
};

// Define the type for the node data if needed (optional but good practice)
// interface SlideNodeData {
//   label: string;
//   contentPreview?: string; // Add other data properties as needed
// }

// Use memo to prevent unnecessary re-renders
const SlideNode: React.FC<NodeProps> = memo(({ data, isConnectable }) => {
  // Extract data, provide defaults
  const label = data?.label || '未命名页面';
  const contentPreview = data?.contentPreview || '点击编辑内容...'; // Example content preview

  return (
    <div style={nodeStyle}>
      {/* Input Handle (Top Center) */}
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        isConnectable={isConnectable}
        style={{ background: '#555', width: '8px', height: '8px' }}
      />
      {/* Node Content */}
      <div style={titleStyle}>{label}</div>
      <div style={contentPreviewStyle}>{contentPreview}</div>

      {/* Output Handle (Bottom Center) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
        style={{ background: '#555', width: '8px', height: '8px' }}
      />
       {/* Optional: Left/Right Handles */}
       <Handle type="target" position={Position.Left} id="l" isConnectable={isConnectable} style={{ background: '#aaa', top: '50%', width: '6px', height: '10px', borderRadius: '2px' }} />
       <Handle type="source" position={Position.Right} id="r" isConnectable={isConnectable} style={{ background: '#aaa', top: '50%', width: '6px', height: '10px', borderRadius: '2px' }} />
    </div>
  );
});

SlideNode.displayName = 'SlideNode'; // Add display name for better debugging

export default SlideNode;
