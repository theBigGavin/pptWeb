import React, { memo, useCallback, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { Layer, LayerType, NodeData, TextLayer, TitleLayer, FooterLayer, MediaLayer, TableLayer, ChartLayer } from "../../types";

// Basic styling for the custom node
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
  // overflow: 'visible', // Allow handles to potentially overflow node bounds
};

// Define the extended data structure expected by this component
interface SlideNodeDataWithUpdate extends NodeData {
    updateLayerData: (nodeId: string, layerId: string, newLayerData: Partial<Layer>) => void;
    setSelectedLayerId: (layerId: string | null) => void;
    nodeId: string;
    selectedLayerId: string | null;
}

const SlideNode: React.FC<NodeProps<SlideNodeDataWithUpdate>> = memo(({ data, isConnectable, selected, id: nodeIdProp }) => {

  const { label = "未命名页面", layers = [], updateLayerData, setSelectedLayerId, nodeId = nodeIdProp, selectedLayerId } = data;

  // State to track if resizing is in progress
  const [isResizing, setIsResizing] = useState(false);
  // State to track original dimensions and position during resize (might not be needed with simplified resize)
  // const [originalRect, setOriginalRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);


  const dynamicNodeStyle: React.CSSProperties = {
    ...nodeStyle,
    border: selected ? `2px solid rgba(66, 133, 244, 0.5)` : nodeStyle.border,
    boxShadow: selected ? 'none' : nodeStyle.boxShadow,
  };

  const parsePixels = (value: string | number | undefined): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value.replace('px', '')) || 0;
      return 0;
  };

  return (
    <div style={dynamicNodeStyle}>
      <Handle type="target" position={Position.Top} id="t" isConnectable={isConnectable} style={{ background: "#555", width: "8px", height: "8px" }} />

      <div
        className="slide-node-layer-container"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }} // Keep overflow hidden here
      >
        {layers.map((layer: Layer) => {
          const draggableRef = useRef<HTMLDivElement>(null);

          const position = {
            x: parsePixels(layer.style?.left),
            y: parsePixels(layer.style?.top),
          };

          // Resize start handler: Set resizing flag and select layer
          const handleResizeStart = (e: React.SyntheticEvent) => {
              console.log("Layer resize start:", layer.id);
              e.stopPropagation();
              // setOriginalRect({ // Not strictly needed for the simplified approach
              //     x: position.x, y: position.y,
              //     width: parsePixels(layer.style?.width) || 150,
              //     height: parsePixels(layer.style?.height) || 80,
              // });
              setIsResizing(true);
              setSelectedLayerId(layer.id);
          };

          // onResize handler: Continuously update only size during resize
          const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
              e.stopPropagation();
              // Only update width and height during resize to avoid position conflicts
              updateLayerData(nodeId, layer.id, {
                  style: {
                      ...layer.style, // Keep existing position etc.
                      width: `${data.size.width}px`,
                      height: `${data.size.height}px`,
                  }
              });
          };

          // Resize stop handler: Update final size and clear state
          const handleResizeStop = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
              console.log("Layer resize stop:", layer.id, "Final size:", data.size);
              e.stopPropagation();
              // Ensure final size is updated (might be redundant if onResize worked correctly)
              updateLayerData(nodeId, layer.id, {
                  style: {
                      ...layer.style,
                      width: `${data.size.width}px`,
                      height: `${data.size.height}px`,
                  }
              });
              setIsResizing(false);
              // setOriginalRect(null); // Not needed if not used
          };


           // Draggable start handler
           const handleDragStart = (e: DraggableEvent) => {
               console.log("Layer drag start:", layer.id);
               e.stopPropagation();
               setSelectedLayerId(layer.id);
           };

           // Draggable stop handler
           const handleDragStop = (e: DraggableEvent, dragData: DraggableData) => {
             console.log("Layer drag stop:", layer.id, "New pos:", dragData.x, dragData.y);
             e.stopPropagation();
             // Only update position if not resizing
             if (!isResizing) {
                 updateLayerData(nodeId, layer.id, {
                   style: { ...layer.style, left: `${dragData.x}px`, top: `${dragData.y}px` }
                 });
             }
           };

           // Click handler to select layer
           const handleLayerClick = (e: React.MouseEvent) => {
               e.stopPropagation();
               setSelectedLayerId(layer.id);
           }

          // Base style for the layer content (inside ResizableBox)
          const layerContentStyle: React.CSSProperties = {
            ...layer.style,
            position: undefined, left: undefined, top: undefined,
            width: '100%', height: '100%',
            zIndex: undefined,
            boxSizing: 'border-box',
            cursor: 'move',
          };

          // Render the specific layer content
          const renderLayerContent = () => {
            switch (layer.type) {
              case 'background': return <div style={layerContentStyle} />;
              case 'title': case 'footer': case 'text':
                const textLayer = layer as TextLayer | TitleLayer | FooterLayer;
                return <div style={{ ...layerContentStyle, ...(textLayer.textFormat || {}), whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden' }}>{textLayer.content}</div>;
              case 'media':
                const mediaLayer = layer as MediaLayer;
                if (mediaLayer.mediaType === 'image') return <img src={mediaLayer.url} alt={mediaLayer.altText || `Media ${mediaLayer.id}`} style={{ ...layerContentStyle, objectFit: mediaLayer.objectFit || 'contain', display: 'block' }} draggable={false} />;
                if (mediaLayer.mediaType === 'video') return <video src={mediaLayer.url} controls style={{ ...layerContentStyle, objectFit: mediaLayer.objectFit || 'contain', display: 'block' }} />;
                return null;
              case 'table': const tableLayer = layer as TableLayer; return <div style={layerContentStyle}>[Table: {tableLayer.tableData?.headers?.join(', ')}]</div>;
              case 'chart': const chartLayer = layer as ChartLayer; return <div style={layerContentStyle}>[Chart: {chartLayer.chartType}]</div>;
              case 'content-area': return <div style={{ ...layerContentStyle, border: '1px dashed rgba(0,0,0,0.2)', pointerEvents: 'none' }} />;
              default: return null;
            }
          };

          // Exclude background and content-area from being draggable/resizable
          if (layer.type === 'background' || layer.type === 'content-area') {
              return <div key={layer.id} style={{...layer.style, position: 'absolute', boxSizing: 'border-box'}}>{renderLayerContent()}</div>;
          }

          const initialWidth = parsePixels(layer.style?.width) || 150;
          const initialHeight = parsePixels(layer.style?.height) || 80;

          return (
            <Draggable
              key={`${layer.id}-drag`}
              bounds="parent"
              position={position}
              onStop={handleDragStop}
              onStart={handleDragStart}
              nodeRef={draggableRef as React.RefObject<HTMLElement>}
              disabled={isResizing} // Disable position dragging while resizing
            >
              {/* Wrapper div for Draggable, needs ref */}
              <div
                ref={draggableRef}
                className="nodrag"
                style={{
                    position: 'absolute', left: 0, top: 0, // Positioned by Draggable
                    // Size is now controlled by ResizableBox, get from layer style
                    width: layer.style?.width,
                    height: layer.style?.height,
                    zIndex: layer.style?.zIndex,
                    outline: selectedLayerId === layer.id ? '1px dashed var(--accent-color)' : 'none',
                    outlineOffset: '1px',
                    overflow: 'visible', // Allow handles to overflow this div
                }}
                onClick={handleLayerClick}
              >
                <ResizableBox
                  width={initialWidth}
                  height={initialHeight}
                  onResizeStart={handleResizeStart}
                  onResize={handleResize} // Update size continuously
                  onResizeStop={handleResizeStop}
                  draggableOpts={{ stopPropagation: true }} // Stop propagation from handles
                  resizeHandles={selectedLayerId === layer.id ? ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's'] : []} // Show handles only when selected
                  minConstraints={[30, 20]}
                  style={{
                      width: '100%', height: '100%',
                      position: 'relative',
                      overflow: 'visible', // Allow handles to overflow ResizableBox
                  }}
                >
                  {/* Render content inside ResizableBox */}
                  <div style={{...layerContentStyle, overflow: 'hidden' }}> {/* Clip content inside */}
                      {renderLayerContent()}
                  </div>
                </ResizableBox>
              </div>
            </Draggable>
          );
        })}
      </div>

      {/* Output Handles */}
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} style={{ background: "#555", width: "8px", height: "8px" }} />
      <Handle type="target" position={Position.Left} id="l" isConnectable={isConnectable} style={{ background: "#aaa", top: "50%", width: "6px", height: "10px", borderRadius: "2px" }} />
      <Handle type="source" position={Position.Right} id="r" isConnectable={isConnectable} style={{ background: "#aaa", top: "50%", width: "6px", height: "10px", borderRadius: "2px" }} />
    </div>
  );
});

SlideNode.displayName = "SlideNode";

export default SlideNode;
