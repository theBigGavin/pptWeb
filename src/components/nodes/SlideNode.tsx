import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Layer,
  NodeData,
} from "../../types";
import DraggableLayer from "./DraggableLayer";

// Basic styling for the custom node
const nodeStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  padding: "10px",
  fontSize: "10px",
  textAlign: "left",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  position: "relative",
  // width and height will be applied dynamically
};

// Define the extended data structure expected by this component
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
  // width and height are now expected in data for direct application
}

// Add isPreviewing as an optional prop to the component signature
const SlideNode: React.FC<NodeProps<SlideNodeDataWithUpdate> & { isPreviewing?: boolean }> = memo(
  ({ data, isConnectable, selected, id: nodeIdProp, isPreviewing = false }) => {
    const {
      layers = [],
      updateLayerData,
      setSelectedLayerId,
      nodeId = nodeIdProp,
      selectedLayerId,
      setIsLayerPanelVisible,
      setIsPropertiesPanelVisible,
      width: dataWidth, // Destructure width from data
      height: dataHeight, // Destructure height from data
    } = data;

    const dynamicNodeStyle: React.CSSProperties = {
      ...nodeStyle,
      // Apply width and height directly from data prop
      width: dataWidth ?? 600, // Use width from data, provide a fallback
      height: dataHeight ?? 337.5, // Use height from data, provide a fallback
      border: selected && !isPreviewing ? `2px solid rgba(66, 133, 244, 0.5)` : nodeStyle.border, // Show selection only if not previewing
      boxShadow: selected && !isPreviewing ? "none" : nodeStyle.boxShadow,
      boxSizing: 'border-box',
      minWidth: 'unset',
      minHeight: 'unset',
    };

    return (
      <div style={dynamicNodeStyle}>
        {/* Conditionally render handles only if not in preview mode */}
        {!isPreviewing && (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id="t"
              isConnectable={isConnectable}
              style={{ background: "#555", width: "8px", height: "8px" }}
            />
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
          </>
        )}

        <div
          className="slide-node-layer-container"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", // Layer container should fill the node
            height: "100%",
            overflow: "hidden",
            pointerEvents: isPreviewing ? 'none' : 'auto', // Disable interaction with layers in preview
          }}
        >
          {layers.map((layer: Layer) => {
            // Render background and content-area directly
            if (layer.type === "background" || layer.type === "content-area") {
              const simpleLayerStyle: React.CSSProperties = {
                ...layer.style,
                position: "absolute",
                boxSizing: "border-box",
                pointerEvents: 'none', // Ensure these are not interactive
                // Add matching border radius specifically for the background layer
                borderRadius: layer.type === "background" ? nodeStyle.borderRadius : undefined,
                // Ensure background covers the entire area, respecting potential padding of the parent
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
              };
              // We also need to make sure the layer container itself allows the radius to show
              // by setting overflow: hidden on it. (Already done on line 123)
              return <div key={layer.id} style={simpleLayerStyle} />;
            }

            // Render other layers using the DraggableLayer component
            // Pass isPreviewing to DraggableLayer if it needs to adjust behavior
            return (
              <DraggableLayer
                key={layer.id}
                layer={layer}
                nodeId={nodeId}
                selectedLayerId={selectedLayerId}
                updateLayerData={updateLayerData}
                setSelectedLayerId={setSelectedLayerId}
                setIsLayerPanelVisible={setIsLayerPanelVisible}
                setIsPropertiesPanelVisible={setIsPropertiesPanelVisible}
                // Pass isPreviewing down if DraggableLayer needs it
                // isPreviewing={isPreviewing}
              />
            );
          })}
        </div>
        {/* Handles are now rendered conditionally above */}
      </div>
    );
  }
);

SlideNode.displayName = "SlideNode";

export default SlideNode;
