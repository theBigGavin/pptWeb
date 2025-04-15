import React, { memo } from "react"; // Removed useState, useRef
import { Handle, Position, NodeProps } from "reactflow";
// Removed Draggable, ResizableBox imports as they are now in DraggableLayer
import {
  Layer,
  NodeData,
  // Import specific layer types if needed for background/content-area rendering
} from "../../types";
import DraggableLayer from "./DraggableLayer"; // Import the new component

// Basic styling for the custom node (can remain the same)
const nodeStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  padding: "10px",
  fontSize: "10px",
  width: 320,
  height: 180,
  textAlign: "left",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  position: "relative",
};

// Define the extended data structure expected by this component (remains the same)
interface SlideNodeDataWithUpdate extends NodeData {
  updateLayerData: (
    nodeId: string,
    layerId: string,
    newLayerData: Partial<Layer>
  ) => void;
  setSelectedLayerId: (layerId: string | null) => void;
  nodeId: string;
  selectedLayerId: string | null;
  setIsLayerPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPropertiesPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SlideNode: React.FC<NodeProps<SlideNodeDataWithUpdate>> = memo(
  ({ data, isConnectable, selected, id: nodeIdProp }) => {
    const {
      layers = [],
      updateLayerData,
      setSelectedLayerId,
      nodeId = nodeIdProp,
      selectedLayerId,
      setIsLayerPanelVisible,
      setIsPropertiesPanelVisible,
    } = data;

    // Removed isResizing state

    const dynamicNodeStyle: React.CSSProperties = {
      ...nodeStyle,
      border: selected ? `2px solid rgba(66, 133, 244, 0.5)` : nodeStyle.border,
      boxShadow: selected ? "none" : nodeStyle.boxShadow,
    };

    // Removed parsePixels as it's now in DraggableLayer

    return (
      <div style={dynamicNodeStyle}>
        <Handle
          type="target"
          position={Position.Top}
          id="t"
          isConnectable={isConnectable}
          style={{ background: "#555", width: "8px", height: "8px" }}
        />

        <div
          className="slide-node-layer-container"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {layers.map((layer: Layer) => {
            // Removed all handlers, style calculations, renderLayerContent, Draggable, ResizableBox

            // Render background and content-area directly
            if (layer.type === "background" || layer.type === "content-area") {
              // Simplified rendering for non-interactive layers
              const simpleLayerStyle: React.CSSProperties = {
                ...layer.style,
                position: "absolute",
                boxSizing: "border-box",
                pointerEvents:
                  layer.type === "content-area" ? "none" : undefined, // Keep pointerEvents for content-area
                border:
                  layer.type === "content-area"
                    ? "1px dashed rgba(0,0,0,0.2)"
                    : undefined, // Keep border for content-area
              };
              return <div key={layer.id} style={simpleLayerStyle} />;
            }

            // Render other layers using the DraggableLayer component
            return (
              <DraggableLayer
                key={layer.id} // Pass key here
                layer={layer}
                nodeId={nodeId}
                selectedLayerId={selectedLayerId}
                updateLayerData={updateLayerData}
                setSelectedLayerId={setSelectedLayerId}
                setIsLayerPanelVisible={setIsLayerPanelVisible}
                setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
              />
            );
          })}
        </div>

        {/* Output Handles */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          isConnectable={isConnectable}
          style={{ background: "#555", width: "8px", height: "8px" }}
        />
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
  }
);

SlideNode.displayName = "SlideNode";

export default SlideNode;
