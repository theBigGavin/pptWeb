import React, { useRef, useState, useMemo } from "react"; // Added useMemo
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import {
  Layer,
  // FillLayer, // Removed FillLayer import
  TextLayer,
  TitleLayer,
  FooterLayer,
  MediaLayer,
  TableLayer,
  ChartLayer,
} from "../../types";
// Removed import { parseColor } from 'react-aria';

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
}) => {
  const draggableRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Log the received style props for debugging percentage issues
  console.log(`Layer ${layer.id} received style:`, JSON.stringify(layer.style));

  // Updated parsePixels to handle non-pixel values for initial ResizableBox size
  const parsePixels = (
    value: string | number | undefined,
    defaultValue = 100
  ): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Parse if it explicitly ends with 'px'
      if (value.endsWith("px")) {
        const parsed = parseFloat(value);
        // Return parsed value if valid, otherwise the default
        return isNaN(parsed) ? defaultValue : parsed;
      }
      // If the value is '100%', return a minimal default (e.g., 1) for ResizableBox's numeric width prop.
      // The actual visual width is handled by the outer container's style ('100%')
      // and the ResizableBox's own style ('100%').
      // Providing a large numeric prop might interfere with the percentage-based layout.
      if (value === '100%') {
        return 1; // Use a minimal pixel value for the prop
      }
      // For other non-pixel string values (e.g., 'auto', other percentages), return the standard default.
      return defaultValue; // Keep the original default (100) for other cases like 'auto' or undefined
    }
    // For undefined or other types, return the default
    return defaultValue;
  };

  const position = {
    x: parsePixels(layer.style?.left, 0), // Use 0 as default for position
    y: parsePixels(layer.style?.top, 0), // Use 0 as default for position
  };

  // Use the updated parsePixels for initial dimensions, providing potentially different defaults
  const initialWidth = parsePixels(layer.style?.width, 150);
  const initialHeight = parsePixels(layer.style?.height, 80);

  // --- Handlers ---
  const handleResizeStart = (e: React.SyntheticEvent) => {
    // console.log("Layer resize start:", layer.id);
    e.stopPropagation();
    setIsResizing(true);
    setSelectedLayerId(layer.id); // Select layer on resize start
  };

  const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    e.stopPropagation();
    // Update style with pixel values during resize
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
    // console.log("Layer resize stop:", layer.id, "Final size:", data.size);
    e.stopPropagation();
    // Final update with pixel values
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
    // console.log("Layer drag start:", layer.id);
    e.stopPropagation();
    setSelectedLayerId(layer.id); // Select layer on drag start
  };

  const handleDragStop = (e: DraggableEvent, dragData: DraggableData) => {
    // console.log("Layer drag stop:", layer.id, "New pos:", dragData.x, dragData.y);
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
    setSelectedLayerId(layer.id); // Set the selected layer ID
  };

  // --- Render Logic ---
  // Directly use layer.style, applying necessary overrides for the container
  const layerContainerStyle: React.CSSProperties = useMemo(
    () => ({
      ...layer.style, // Apply all styles from the layer object directly
      // Override position/size/zIndex for the internal content div as needed
      position: undefined, // Let the ResizableBox/Draggable handle positioning
      left: undefined,
      top: undefined,
      width: "100%", // Content div takes full width/height of ResizableBox
      height: "100%",
      zIndex: undefined, // zIndex is applied to the outer wrapper
      boxSizing: "border-box",
      cursor: "move", // Default cursor
      overflow: "hidden", // Hide overflow by default
    }),
    [layer.style]
  );

  const renderLayerContent = () => {
    switch (layer.type) {
      case "title":
      case "footer":
      case "text": {
        const textLayer = layer as TextLayer | TitleLayer | FooterLayer;
        // Combine container style with text format styles
        const combinedStyle: React.CSSProperties = {
          ...layerContainerStyle, // Includes background properties now
          ...(textLayer.textFormat || {}),
          // Apply text format properties
          fontFamily: textLayer.textFormat?.fontFamily || undefined,
          display: "flex",
          alignItems: textLayer.textFormat?.verticalAlign || "flex-start",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: "2px 4px",
        };
        return (
          <div style={combinedStyle}>
            <span style={{ width: "100%" }}>{textLayer.content}</span>
          </div>
        );
      }
      case "media": {
        const mediaLayer = layer as MediaLayer;
        if (mediaLayer.mediaType === "image") {
          return (
            <img
              src={mediaLayer.url}
              alt={mediaLayer.altText || `Media ${mediaLayer.id}`}
              style={{
                ...layerContainerStyle, // Includes background properties now
                objectFit: mediaLayer.objectFit || "contain",
                display: "block",
                cursor: "default",
              }}
              draggable={false}
            />
          );
        }
        if (mediaLayer.mediaType === "video") {
          return (
            <video
              src={mediaLayer.url}
              controls
              style={{
                ...layerContainerStyle, // Includes background properties now
                objectFit: mediaLayer.objectFit || "contain",
                display: "block",
                cursor: "default",
              }}
            />
          );
        }
        return null;
      }
      case "table": {
        const tableLayer = layer as TableLayer;
        return (
          <div style={{ ...layerContainerStyle, cursor: "default" }}>
            [Table: {tableLayer.tableData?.headers?.join(", ")}]
          </div>
        );
      }
      case "chart": {
        const chartLayer = layer as ChartLayer;
        return (
          <div style={{ ...layerContainerStyle, cursor: "default" }}>
            [Chart: {chartLayer.chartType}]
          </div>
        );
      }
      default:
        // For unknown or simple types (like background, content-area)
        // render a div with the applied styles (including background)
        return <div style={layerContainerStyle}></div>;
    }
  };

  // Outer div for Draggable positioning and zIndex
  const outerWrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: 0, // Position is controlled by Draggable wrapper
    top: 0, // Position is controlled by Draggable wrapper
    // Use the actual style value for rendering, which might be percentage
    width: layer.style?.width,
    height: layer.style?.height,
    zIndex: layer.style?.zIndex,
    outline:
      selectedLayerId === layer.id ? "1px dashed var(--accent-color)" : "none",
    outlineOffset: "1px",
    boxSizing: "border-box",
  };

  return (
    <Draggable
      key={`${layer.id}-drag`}
      bounds="parent"
      position={position} // Uses parsed pixel values for initial drag position
      onStop={handleDragStop}
      onStart={handleDragStart}
      nodeRef={draggableRef as React.RefObject<HTMLElement>}
      disabled={isResizing}
    >
      <div
        ref={draggableRef}
        className="nodrag"
        onMouseDown={handleMouseDown}
        style={outerWrapperStyle} // Apply outer styles here (handles percentage rendering)
      >
        <ResizableBox
          // Use parsed pixel values for initial ResizableBox dimensions
          width={initialWidth}
          height={initialHeight}
          onResizeStart={handleResizeStart}
          onResize={handleResize} // Updates style with pixels during resize
          onResizeStop={handleResizeStop} // Saves final size as pixels
          draggableOpts={{ stopPropagation: true }}
          resizeHandles={
            selectedLayerId === layer.id
              ? ["se", "sw", "ne", "nw", "e", "w", "n", "s"]
              : []
          }
          minConstraints={[30, 20]}
          style={{
            width: "100%",
            height: "100%",
            position: "relative", // Needed for handles
          }}
        >
          {/* Content rendering div */}
          {renderLayerContent()}
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default DraggableLayer;
