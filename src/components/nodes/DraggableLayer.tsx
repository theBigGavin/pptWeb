import React, { useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import {
  Layer,
  TextLayer,
  TitleLayer,
  FooterLayer,
  MediaLayer,
  TableLayer,
  ChartLayer,
} from "../../types";

interface DraggableLayerProps {
  layer: Layer;
  nodeId: string;
  selectedLayerId: string | null;
  updateLayerData: (
    nodeId: string,
    layerId: string,
    newLayerData: Partial<Layer>
  ) => void;
  setSelectedLayerId: (layerId: string | null) => void;
  setIsLayerPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPropertiesPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const DraggableLayer: React.FC<DraggableLayerProps> = ({
  layer,
  nodeId,
  selectedLayerId,
  updateLayerData,
  setSelectedLayerId,
  // Panel setters are no longer needed directly in the click handler here
  // setIsLayerPanelVisible,
  // setIsPropertiesPanelVisible,
}) => {
  const draggableRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const parsePixels = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string")
      return parseFloat(value.replace("px", "")) || 0;
    return 0;
  };

  const position = {
    x: parsePixels(layer.style?.left),
    y: parsePixels(layer.style?.top),
  };

  const initialWidth = parsePixels(layer.style?.width) || 150;
  const initialHeight = parsePixels(layer.style?.height) || 80;

  // --- Handlers ---
  const handleResizeStart = (e: React.SyntheticEvent) => {
    console.log("Layer resize start:", layer.id);
    e.stopPropagation();
    setIsResizing(true);
    setSelectedLayerId(layer.id); // Select layer on resize start
  };

  const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    e.stopPropagation();
    updateLayerData(nodeId, layer.id, {
      style: {
        ...layer.style,
        width: `${data.size.width}px`,
        height: `${data.size.height}px`,
      },
    });
  };

  const handleResizeStop = (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => {
    console.log("Layer resize stop:", layer.id, "Final size:", data.size);
    e.stopPropagation();
    updateLayerData(nodeId, layer.id, {
      style: {
        ...layer.style,
        width: `${data.size.width}px`,
        height: `${data.size.height}px`,
      },
    });
    setIsResizing(false);
  };

  const handleDragStart = (e: DraggableEvent) => {
    console.log("Layer drag start:", layer.id);
    e.stopPropagation();
    setSelectedLayerId(layer.id); // Select layer on drag start
  };

  const handleDragStop = (e: DraggableEvent, dragData: DraggableData) => {
    console.log(
      "Layer drag stop:",
      layer.id,
      "New pos:",
      dragData.x,
      dragData.y
    );
    e.stopPropagation();
    if (!isResizing) {
      updateLayerData(nodeId, layer.id, {
        style: {
          ...layer.style,
          left: `${dragData.x}px`,
          top: `${dragData.y}px`,
        },
      });
    }
  };

  // NEW: Handle mouse down on the draggable container
  const handleMouseDown = () => {
    // Removed unused 'e' parameter
    // Don't stop propagation here, let React Flow handle node selection
    setSelectedLayerId(layer.id); // Set the selected layer ID
  };

  // --- Render Logic ---
  const layerContentStyle: React.CSSProperties = {
    ...layer.style,
    position: undefined,
    left: undefined,
    top: undefined,
    width: "100%",
    height: "100%",
    zIndex: undefined,
    boxSizing: "border-box",
    cursor: "move",
  };

  const renderLayerContent = () => {
    switch (layer.type) {
      case "title":
      case "footer":
      case "text": {
        const textLayer = layer as TextLayer | TitleLayer | FooterLayer;
        // Removed onClick from inner elements
        return (
          <div
            style={{
              ...layerContentStyle,
              ...(textLayer.textFormat || {}),
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            {textLayer.content}
          </div>
        );
      }
      case "media": {
        const mediaLayer = layer as MediaLayer;
        if (mediaLayer.mediaType === "image") {
          // Removed onClick from inner elements
          return (
            <img
              src={mediaLayer.url}
              alt={mediaLayer.altText || `Media ${mediaLayer.id}`}
              style={{
                ...layerContentStyle,
                objectFit: mediaLayer.objectFit || "contain",
                display: "block",
              }}
              draggable={false}
            />
          );
        }
        if (mediaLayer.mediaType === "video") {
          // Removed onClick from inner elements
          return (
            <video
              src={mediaLayer.url}
              controls
              style={{
                ...layerContentStyle,
                objectFit: mediaLayer.objectFit || "contain",
                display: "block",
              }}
            />
          );
        }
        return null;
      }
      case "table": {
        const tableLayer = layer as TableLayer;
        // Removed onClick from inner elements
        return (
          <div style={layerContentStyle}>
            [Table: {tableLayer.tableData?.headers?.join(", ")}]
          </div>
        );
      }
      case "chart": {
        const chartLayer = layer as ChartLayer;
        // Removed onClick from inner elements
        return (
          <div style={layerContentStyle}>[Chart: {chartLayer.chartType}]</div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Draggable
      key={`${layer.id}-drag`}
      bounds="parent"
      position={position}
      onStop={handleDragStop}
      onStart={handleDragStart}
      nodeRef={draggableRef as React.RefObject<HTMLElement>} // Keep assertion
      disabled={isResizing}
    >
      <div
        ref={draggableRef}
        className="nodrag"
        onMouseDown={handleMouseDown} // Use onMouseDown here
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: layer.style?.width,
          height: layer.style?.height,
          zIndex: layer.style?.zIndex,
          outline:
            selectedLayerId === layer.id
              ? "1px dashed var(--accent-color)"
              : "none",
          outlineOffset: "1px",
          overflow: "visible",
        }}
      >
        <ResizableBox
          width={initialWidth}
          height={initialHeight}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          draggableOpts={{ stopPropagation: true }} // Keep stopping propagation from handles
          resizeHandles={
            selectedLayerId === layer.id
              ? ["se", "sw", "ne", "nw", "e", "w", "n", "s"]
              : []
          }
          minConstraints={[30, 20]}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div style={{ ...layerContentStyle, overflow: "hidden" }}>
            {renderLayerContent()}
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default DraggableLayer;
