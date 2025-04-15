import React, { useEffect, useMemo, useCallback } from "react";
import { SlideNode, NodeData, Layer, LayerType, TextFormat, MediaLayer, TableLayer, ChartLayer, TextLayer, TitleLayer, FooterLayer } from "../types"; // Import necessary types

// Define the props type
interface PropertiesPanelProps {
  selectedNode: SlideNode | null;
  selectedLayerId: string | null; // ID of the selected layer within the node
  updateLayerData: (nodeId: string, layerId: string, newLayerData: Partial<Layer>) => void; // Function to update layer data
  deleteNode: (nodeId: string) => void;
  // TODO: Add deleteLayer function prop later
}

// Helper function to render common style editors
const renderCommonStyleEditors = (
    layer: Layer,
    nodeId: string,
    updateLayerData: PropertiesPanelProps['updateLayerData']
) => {
    const handleStyleChange = (property: keyof React.CSSProperties, value: any) => {
        updateLayerData(nodeId, layer.id, {
            style: { ...layer.style, [property]: value }
        });
    };

    return (
        <>
            {/* Position & Size */}
            <div className="property-group">
                <h4>位置和大小</h4>
                <label>Left:</label>
                <input type="number" value={layer.style?.left ?? ''} onChange={(e) => handleStyleChange('left', e.target.value + 'px')} />
                <label>Top:</label>
                <input type="number" value={layer.style?.top ?? ''} onChange={(e) => handleStyleChange('top', e.target.value + 'px')} />
                <label>Width:</label>
                <input type="text" value={layer.style?.width ?? ''} onChange={(e) => handleStyleChange('width', e.target.value)} placeholder="e.g., 100px or 50%" />
                <label>Height:</label>
                <input type="text" value={layer.style?.height ?? ''} onChange={(e) => handleStyleChange('height', e.target.value)} placeholder="e.g., 50px or auto" />
            </div>
            {/* Background */}
            <div className="property-group">
                <h4>背景</h4>
                <label>颜色:</label>
                <input type="color" value={layer.style?.backgroundColor ?? '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} />
                <label>图片 URL:</label>
                <input type="text" value={layer.style?.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/, '$1') ?? ''} onChange={(e) => handleStyleChange('backgroundImage', e.target.value ? `url(${e.target.value})` : undefined)} placeholder="输入图片 URL" />
                 {/* Add more background properties like size, repeat etc. if needed */}
            </div>
             {/* Z-Index */}
             <div className="property-group">
                 <label htmlFor={`layerZIndex-${layer.id}`}>层级 (Z-Index):</label>
                 <input
                     type="number"
                     id={`layerZIndex-${layer.id}`}
                     value={layer.style?.zIndex ?? 0}
                     onChange={(e) => handleStyleChange('zIndex', parseInt(e.target.value, 10) || 0)}
                 />
             </div>
        </>
    );
};

// Helper function to render text format editors
const renderTextFormatEditors = (
    layer: TextLayer | TitleLayer | FooterLayer, // Types that have textFormat
    nodeId: string,
    updateLayerData: PropertiesPanelProps['updateLayerData']
) => {
    const handleTextFormatChange = (property: keyof TextFormat, value: any) => {
        updateLayerData(nodeId, layer.id, {
            textFormat: { ...(layer.textFormat || {}), [property]: value }
        });
    };

    const textFormat = layer.textFormat || {};

    return (
        <div className="property-group">
            <h4>文本格式</h4>
            <label>字体大小:</label>
            <input type="text" value={textFormat.fontSize ?? ''} onChange={(e) => handleTextFormatChange('fontSize', e.target.value)} placeholder="e.g., 16px or 1.2em" />
            <label>颜色:</label>
            <input type="color" value={textFormat.color ?? '#000000'} onChange={(e) => handleTextFormatChange('color', e.target.value)} />
            <label>粗细:</label>
            <input type="text" value={textFormat.fontWeight ?? ''} onChange={(e) => handleTextFormatChange('fontWeight', e.target.value)} placeholder="e.g., bold or 600" />
            <label>对齐:</label>
            <select value={textFormat.textAlign ?? 'left'} onChange={(e) => handleTextFormatChange('textAlign', e.target.value)}>
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
                <option value="justify">两端对齐</option>
            </select>
            {/* Add more text format inputs: fontStyle, fontFamily, etc. */}
        </div>
    );
};


const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedLayerId,
  updateLayerData,
  deleteNode,
}) => {

  // Find the selected layer object based on selectedLayerId
  const selectedLayer = useMemo(() => {
    if (!selectedNode || !selectedLayerId) return null;
    return selectedNode.data?.layers.find(layer => layer.id === selectedLayerId) || null;
  }, [selectedNode, selectedLayerId]);

  // --- Event Handlers for Specific Layer Types ---

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode && selectedLayer) {
      updateLayerData(selectedNode.id, selectedLayer.id, { name: event.target.value });
    }
  }, [selectedNode, selectedLayer, updateLayerData]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (selectedNode && selectedLayer && ('content' in selectedLayer)) {
          updateLayerData(selectedNode.id, selectedLayer.id, { content: event.target.value });
      }
  }, [selectedNode, selectedLayer, updateLayerData]);

  const handleMediaUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNode && selectedLayer?.type === 'media') {
          updateLayerData(selectedNode.id, selectedLayer.id, { url: event.target.value });
      }
  }, [selectedNode, selectedLayer, updateLayerData]);

   const handleMediaTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedNode && selectedLayer?.type === 'media') {
            updateLayerData(selectedNode.id, selectedLayer.id, { mediaType: event.target.value as MediaLayer['mediaType'] });
        }
    }, [selectedNode, selectedLayer, updateLayerData]);

    const handleObjectFitChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedNode && selectedLayer?.type === 'media') {
            updateLayerData(selectedNode.id, selectedLayer.id, { objectFit: event.target.value as MediaLayer['objectFit'] });
        }
    }, [selectedNode, selectedLayer, updateLayerData]);

  // --- Render Logic ---

  const renderLayerSpecificEditors = () => {
    if (!selectedNode || !selectedLayer) return null;

    switch (selectedLayer.type) {
      case 'title':
      case 'footer':
      case 'text':
        return (
          <>
            <div className="property-group">
              <label htmlFor={`layerContent-${selectedLayer.id}`}>内容:</label>
              <textarea
                id={`layerContent-${selectedLayer.id}`}
                value={selectedLayer.content}
                onChange={handleContentChange}
                rows={3}
              />
            </div>
            {renderTextFormatEditors(selectedLayer, selectedNode.id, updateLayerData)}
          </>
        );
      case 'media':
        return (
          <>
            <div className="property-group">
              <label htmlFor={`layerUrl-${selectedLayer.id}`}>媒体 URL:</label>
              <input
                type="text"
                id={`layerUrl-${selectedLayer.id}`}
                value={selectedLayer.url}
                onChange={handleMediaUrlChange}
                placeholder="输入图片/视频 URL"
              />
            </div>
             <div className="property-group">
                <label htmlFor={`layerMediaType-${selectedLayer.id}`}>媒体类型:</label>
                <select
                    id={`layerMediaType-${selectedLayer.id}`}
                    value={selectedLayer.mediaType}
                    onChange={handleMediaTypeChange}
                >
                    <option value="image">图片</option>
                    <option value="video">视频</option>
                    {/* <option value="animation">动画</option> */}
                </select>
            </div>
             <div className="property-group">
                <label htmlFor={`layerObjectFit-${selectedLayer.id}`}>适应方式:</label>
                <select
                    id={`layerObjectFit-${selectedLayer.id}`}
                    value={selectedLayer.objectFit ?? 'contain'}
                    onChange={handleObjectFitChange}
                >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                    <option value="scale-down">Scale Down</option>
                </select>
            </div>
          </>
        );
      case 'table':
        return <p>表格编辑功能待实现。</p>;
      case 'chart':
        return <p>图表编辑功能待实现。</p>;
      case 'background':
        return <p>背景属性通过下方样式编辑。</p>; // Background only has style properties
       case 'content-area':
        return <p>内容区域仅用于布局，无特定属性。</p>;
      default:
        return <p>未知图层类型。</p>;
    }
  };

  return (
    <>
      <h3 className="properties-panel-title">属性编辑</h3>
      {selectedNode ? (
        <>
          {selectedLayer ? (
            <div>
              <div className="property-group">
                <label htmlFor={`layerName-${selectedLayer.id}`}>图层名称:</label>
                <input
                  type="text"
                  id={`layerName-${selectedLayer.id}`}
                  value={selectedLayer.name}
                  onChange={handleNameChange}
                />
              </div>
              <p style={{ fontSize: '0.8em', color: '#999' }}>类型: {selectedLayer.type}, ID: {selectedLayer.id}</p>
              <hr style={{ margin: '15px 0', borderColor: 'var(--border-color-light)' }} />

              {/* Render editors specific to the selected layer type */}
              {renderLayerSpecificEditors()}

              <hr style={{ margin: '15px 0', borderColor: 'var(--border-color-light)' }} />

              {/* Render common style editors for all layer types */}
              {renderCommonStyleEditors(selectedLayer, selectedNode.id, updateLayerData)}

              {/* TODO: Add Delete Layer Button */}
               <button
                   // onClick={() => deleteLayer(selectedNode.id, selectedLayer.id)} // Needs deleteLayer function
                   style={{ marginTop: '15px', backgroundColor: '#ffc107', color: 'black' }}
                   disabled // Disable until function is implemented
               >
                   删除此图层 (待实现)
               </button>

            </div>
          ) : (
            <p style={{ color: "#777", textAlign: "center", marginTop: "20px" }}>
              请在左侧图层面板选择一个图层进行编辑
            </p>
          )}

          <hr style={{ margin: '25px 0', borderColor: 'var(--border-color-medium)' }} />

          {/* Node-level actions */}
          <button
            onClick={() => deleteNode(selectedNode.id)}
            style={{
              padding: "8px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontSize: "0.9em",
            }}
          >
            删除此页面
          </button>
           <p style={{ fontSize: "0.8em", color: "#777", marginTop: '10px' }}>
             页面 ID: {selectedNode.id}
           </p>
        </>
      ) : (
        <p style={{ color: "#777", textAlign: "center", marginTop: "30px" }}>
          请在编辑区选中一个页面进行编辑
        </p>
      )}
    </>
  );
};

export default PropertiesPanel;
