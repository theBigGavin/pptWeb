import React, { useState, useEffect, ChangeEvent } from 'react';
import { Node } from 'reactflow';

// Define the props type
interface PropertiesPanelProps {
  selectedNode: Node | null;
  updateNodeData: (nodeId: string, newData: any) => void; // Function to update node data in App state
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, updateNodeData }) => {
  // Local state to manage form inputs, synced with selectedNode
  const [labelText, setLabelText] = useState('');
  // Add more states for other properties like color, layout etc.
  // const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Effect to update local state when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setLabelText(selectedNode.data?.label || '');
      // setBackgroundColor(selectedNode.data?.backgroundColor || '#ffffff');
    } else {
      // Reset when no node is selected
      setLabelText('');
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


  return (
    <div className="properties-panel-container">
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
             <label>布局:</label>
             <select disabled> {/* Placeholder */}
                 <option>标准</option>
                 <option>标题+内容</option>
                 <option>空白</option>
             </select>
          </div>

           <div className="property-group">
             <label>内容:</label>
             <textarea placeholder="编辑页面详细内容... (功能待实现)" disabled></textarea>
          </div>

          {/* Add more property editors here */}
          <p style={{fontSize: '0.8em', color: '#777'}}>ID: {selectedNode.id}</p>

        </div>
      ) : (
        <p style={{ color: '#777', textAlign: 'center', marginTop: '30px' }}>请在编辑区选中一个页面进行编辑</p>
      )}
    </div>
  );
};

export default PropertiesPanel;