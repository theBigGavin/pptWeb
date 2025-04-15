import React, { useState, useEffect } from 'react';
import { Tree, NodeRendererProps, NodeApi } from 'react-arborist';
import { SlideNode, NodeData, Layer, LayerType } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage, faFont, faTable, faChartBar, faSquare, faHeading, faAlignLeft, faQuestionCircle, faFilm, faPalette, faFile // Added faFile as a generic page icon
} from '@fortawesome/free-solid-svg-icons';

// Define the tree node structure used by react-arborist
interface TreeNode {
  id: string; // Corresponds to Layer ID or Node ID for the root
  name: string;
  children?: TreeNode[];
  layerType?: Layer['type']; // Optional: only layers have this
  isPageNode?: boolean; // Flag to identify the root page node
}

// Updated NodeRenderer to handle page node vs layer node and use FontAwesome
function NodeRenderer({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
  const getIcon = (type: Layer['type']) => {
    switch (type) {
      case 'background': return faPalette;
      case 'title': return faHeading;
      case 'text': return faFont;
      case 'media': return faImage; // Consider adding logic for video icon (faFilm) based on mediaType if available
      case 'table': return faTable;
      case 'chart': return faChartBar;
      case 'footer': return faAlignLeft;
      case 'content-area': return faSquare;
      default: return faQuestionCircle;
    }
  };

  // Apply conditional styling for selected node (layers only)
  const isLayerSelected = !node.data.isPageNode && node.isSelected;
  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: isLayerSelected ? 'var(--accent-focus-shadow)' : 'transparent',
    borderRadius: '3px',
    cursor: 'pointer',
    display: 'flex', // Use flex for alignment
    alignItems: 'center', // Vertically align icon and text
  };

  // Choose icon: Page icon for root, layer icon otherwise
  const icon = node.data.isPageNode
    ? faFile // Use a generic file/page icon for the root node
    : node.data.layerType // Check if layerType exists before calling getIcon
      ? getIcon(node.data.layerType)
      : faQuestionCircle; // Fallback icon if layerType is missing (shouldn't happen for layers)

  return (
    <div style={combinedStyle} ref={dragHandle} className="react-arborist-node">
      <FontAwesomeIcon icon={icon} style={{ marginRight: '6px', width: '12px', opacity: 0.8, flexShrink: 0 }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}> {/* Prevent text wrapping */}
        {node.data.name}
      </span>
    </div>
  );
}

interface LayerPanelProps {
  isVisible: boolean;
  selectedNode: SlideNode | null;
  selectedLayerId: string | null;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
  addLayer: (nodeId: string, layerType: LayerType) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  isVisible,
  selectedNode,
  selectedLayerId,
  setSelectedLayerId,
  addLayer,
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [shouldRender, setShouldRender] = useState(isVisible);

  // Update tree data based on the selected node's layers
  useEffect(() => {
    if (selectedNode?.data) { // Check if selectedNode and its data exist
        // Create the root node representing the page
        const pageRootNode: TreeNode = {
            id: selectedNode.id, // Use node ID as root ID
            name: selectedNode.data.label || `Page ${selectedNode.id}`,
            isPageNode: true, // Mark as page node
            children: (selectedNode.data.layers || []) // Map layers as children
              .sort((a, b) => {
                const zA = typeof a.style?.zIndex === 'number' ? a.style.zIndex : 0;
                const zB = typeof b.style?.zIndex === 'number' ? b.style.zIndex : 0;
                return zA - zB; // Sort layers by zIndex
              })
              .map(layer => ({
                id: layer.id,
                name: layer.name || `Layer ${layer.id}`,
                layerType: layer.type, // Keep layer type info
              })),
          };
        setTreeData([pageRootNode]); // Set tree data as an array with the single root node
    } else {
      setTreeData([]); // Clear tree if no node is selected
    }
    // Reset logic is handled in App.tsx
  }, [selectedNode]); // Depend only on selectedNode object

  // Effect to handle mounting/unmounting with delay for exit animation
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isVisible) {
      setShouldRender(true);
    } else {
      timerId = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
    return () => clearTimeout(timerId);
  }, [isVisible]);

  // Handle selection change in the tree
  const handleTreeSelect = (selectedTreeNodes: NodeApi<TreeNode>[]) => {
    const firstSelected = selectedTreeNodes[0];
    // Only update selection if it's a layer node (not the page root)
    if (firstSelected && !firstSelected.data.isPageNode) {
        setSelectedLayerId(firstSelected.id);
    } else {
        setSelectedLayerId(null); // Deselect if root or nothing is selected
    }
  };

  // Handle adding a new layer
  const handleAddLayer = (type: LayerType) => {
      if (selectedNode) {
          addLayer(selectedNode.id, type);
      }
  };

  // Control rendering based on shouldRender state for exit animation
  if (!shouldRender) {
    return null;
  }

  // Basic button style
  const buttonStyle: React.CSSProperties = {
      fontSize: '0.8em',
      padding: '3px 6px',
      cursor: 'pointer',
      backgroundColor: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color-light)',
      borderRadius: '3px',
      color: 'var(--text-secondary)',
  };

  return (
    <div className={`layer-panel ${isVisible ? 'visible' : ''}`}>
      <h3>Layers</h3>
      {/* Add paddingLeft to the wrapper */}
      <div style={{ flexGrow: 1, overflow: 'hidden', paddingLeft: '10px' }}>
        <Tree<TreeNode>
          data={treeData}
          openByDefault // Open the root node by default (only one prop instance now)
          width={250} // Keep width consistent with CSS (Tree needs explicit width)
          height={1000} // Provide a large height, flexbox will manage actual size
          indent={24}
          rowHeight={30}
          selection={selectedLayerId ?? undefined} // Convert null to undefined
          onSelect={handleTreeSelect}
        >
          {NodeRenderer}
        </Tree>
      </div>
      {/* Add Layer Buttons Area */}
      {selectedNode && (
        <div className="layer-panel-actions" style={{ padding: '10px', borderTop: '1px solid var(--border-color-light)', display: 'flex', gap: '5px', flexWrap: 'wrap', flexShrink: 0 }}>
           <button onClick={() => handleAddLayer('text')} title="添加文本图层" style={buttonStyle}>+ Text</button>
           <button onClick={() => handleAddLayer('media')} title="添加图片图层" style={buttonStyle}>+ Image</button>
           {/* Add buttons for other layer types here */}
        </div>
      )}
    </div>
  );
};

export default LayerPanel;