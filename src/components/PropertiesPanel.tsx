import React, { useState, useMemo, useCallback } from "react"; // Added useState
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faChevronDown,
  faChevronRight,
  // faEye, // Removed unused fill icons
  // faEyeSlash,
  // faTrash,
  // faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  SlideNode,
  /*NodeData,*/ Layer,
  // FillLayer, // Removed FillLayer import
  /*LayerType,*/ TextFormat,
  MediaLayer,
  /*TableLayer,*/ /*ChartLayer,*/ TextLayer,
  TitleLayer,
  FooterLayer,
} from "../types"; // Import necessary types, removed unused NodeData, LayerType, TableLayer, ChartLayer

// Define the props type
interface PropertiesPanelProps {
  selectedNode: SlideNode | null;
  selectedLayerId: string | null; // ID of the selected layer within the node
  updateLayerData: (
    nodeId: string,
    layerId: string,
    newLayerData: Partial<Layer>
  ) => void; // Function to update layer data
  deleteNode: (nodeId: string) => void;
  deleteLayer: (nodeId: string, layerId: string) => void; // Add deleteLayer prop
}

// Helper function to render text format editors
const renderTextFormatEditors = (
  layer: TextLayer | TitleLayer | FooterLayer, // Types that have textFormat
  nodeId: string,
  updateLayerData: PropertiesPanelProps["updateLayerData"]
) => {
  // Use a more specific type for the value
  const handleTextFormatChange = (
    property: keyof TextFormat,
    value: string | undefined
  ) => {
    updateLayerData(nodeId, layer.id, {
      textFormat: { ...(layer.textFormat || {}), [property]: value },
    });
  };

  const textFormat = layer.textFormat || {};

  return (
    <div className="property-group">
      <h4>文本格式</h4>
      <label>字体大小:</label>
      <input
        type="text"
        value={textFormat.fontSize ?? ""}
        onChange={(e) => handleTextFormatChange("fontSize", e.target.value)}
        placeholder="e.g., 16px or 1.2em"
      />
      <label>颜色:</label>
      <input
        type="color"
        value={textFormat.color ?? "#000000"}
        onChange={(e) => handleTextFormatChange("color", e.target.value)}
      />
      <label>粗细:</label>
      <input
        type="text"
        value={textFormat.fontWeight ?? ""}
        onChange={(e) => handleTextFormatChange("fontWeight", e.target.value)}
        placeholder="e.g., bold or 600"
      />
      <label>对齐:</label>
      <div className="button-group">
        <button
          className={`icon-button ${
            (textFormat.textAlign ?? "left") === "left" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("textAlign", "left")}
          title="左对齐"
        >
          <FontAwesomeIcon icon={faAlignLeft} />
        </button>
        <button
          className={`icon-button ${
            textFormat.textAlign === "center" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("textAlign", "center")}
          title="居中对齐"
        >
          <FontAwesomeIcon icon={faAlignCenter} />
        </button>
        <button
          className={`icon-button ${
            textFormat.textAlign === "right" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("textAlign", "right")}
          title="右对齐"
        >
          <FontAwesomeIcon icon={faAlignRight} />
        </button>
        <button
          className={`icon-button ${
            textFormat.textAlign === "justify" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("textAlign", "justify")}
          title="两端对齐"
        >
          <FontAwesomeIcon icon={faAlignJustify} />
        </button>
      </div>
      {/* Vertical Alignment Buttons */}
      <label>垂直对齐:</label>
      <div className="button-group">
        <button
          className={`icon-button vertical-align-top ${
            // Add specific class for rotation
            (textFormat.verticalAlign ?? "flex-start") === "flex-start"
              ? "active"
              : ""
          }`}
          onClick={() => handleTextFormatChange("verticalAlign", "flex-start")}
          title="顶部对齐"
        >
          <FontAwesomeIcon icon={faAlignLeft} /> {/* Rotate this with CSS */}
        </button>
        <button
          className={`icon-button vertical-align-middle ${
            // Add specific class for rotation
            textFormat.verticalAlign === "center" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("verticalAlign", "center")}
          title="居中对齐"
        >
          <FontAwesomeIcon icon={faAlignCenter} /> {/* Rotate this with CSS */}
        </button>
        <button
          className={`icon-button vertical-align-bottom ${
            // Add specific class for rotation
            textFormat.verticalAlign === "flex-end" ? "active" : ""
          }`}
          onClick={() => handleTextFormatChange("verticalAlign", "flex-end")}
          title="底部对齐"
        >
          <FontAwesomeIcon icon={faAlignRight} /> {/* Rotate this with CSS */}
        </button>
      </div>
      {/* Font Family Select */}
      <label>字体:</label>
      <select
        value={textFormat.fontFamily ?? ""}
        onChange={(e) => handleTextFormatChange("fontFamily", e.target.value)}
        className="font-family-select" // Add class for potential styling
      >
        <option value="">默认</option>
        <optgroup label="通用字体">
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
          <option value="fantasy">Fantasy</option>
        </optgroup>
        <optgroup label="常用字体">
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">
            Helvetica Neue
          </option>
          <option value="'Times New Roman', Times, serif">
            Times New Roman
          </option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="'Lucida Console', Monaco, monospace">
            Lucida Console
          </option>
          <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">
            Trebuchet MS
          </option>
          <option value="Verdana, Geneva, sans-serif">Verdana</option>
          {/* Add more specific fonts if needed */}
        </optgroup>
      </select>
      {/* Add more text format inputs: fontStyle, lineHeight etc. */}
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedLayerId,
  updateLayerData,
  deleteNode,
  deleteLayer, // Destructure deleteLayer
}) => {
  // State for accordion sections visibility
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    details: true, // Layer Name, Type, ID
    specific: true, // Type-specific editors
    layout: true, // Position & Size, Z-Index (from common styles)
    text: true, // Text Format (if applicable)
    background: true, // New Background section, initially open
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Find the selected layer object based on selectedLayerId
  const selectedLayer = useMemo(() => {
    if (!selectedNode || !selectedLayerId) return null;
    return (
      selectedNode.data?.layers.find((layer) => layer.id === selectedLayerId) ||
      null
    );
  }, [selectedNode, selectedLayerId]);

  // --- Event Handlers for Specific Layer Types ---

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNode && selectedLayer) {
        updateLayerData(selectedNode.id, selectedLayer.id, {
          name: event.target.value,
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  const handleContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (selectedNode && selectedLayer && "content" in selectedLayer) {
        updateLayerData(selectedNode.id, selectedLayer.id, {
          content: event.target.value,
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  const handleMediaUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNode && selectedLayer?.type === "media") {
        updateLayerData(selectedNode.id, selectedLayer.id, {
          url: event.target.value,
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  const handleMediaTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (selectedNode && selectedLayer?.type === "media") {
        updateLayerData(selectedNode.id, selectedLayer.id, {
          mediaType: event.target.value as MediaLayer["mediaType"],
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  const handleObjectFitChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (selectedNode && selectedLayer?.type === "media") {
        updateLayerData(selectedNode.id, selectedLayer.id, {
          objectFit: event.target.value as MediaLayer["objectFit"],
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  // Define handleStyleChange in the main component scope using useCallback
  const handleStyleChange = useCallback(
    (
      property: keyof React.CSSProperties,
      value: string | number | undefined
    ) => {
      if (selectedNode && selectedLayer) {
        // Ensure value is not undefined before setting, or handle removal explicitly if needed
        const newStyleValue = value === undefined ? null : value;
        updateLayerData(selectedNode.id, selectedLayer.id, {
          style: { ...selectedLayer.style, [property]: newStyleValue },
        });
      }
    },
    [selectedNode, selectedLayer, updateLayerData]
  );

  // Helper function to parse pixel values (or return 0)
  const parsePixels = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string")
      return parseFloat(value.replace("px", "")) || 0;
    return 0;
  };

  // --- Alignment Handlers ---
  const handleCenterHorizontally = useCallback(() => {
    if (!selectedNode || !selectedLayer || !selectedLayer.style) return;
    // Assume fixed node dimensions for now (e.g., from App.tsx defaults)
    const nodeWidth = 320; // TODO: Make this dynamic if node sizes vary
    const layerWidth = parsePixels(selectedLayer.style.width);
    if (layerWidth > 0) {
      const newLeft = (nodeWidth - layerWidth) / 2;
      handleStyleChange("left", `${Math.round(newLeft)}px`);
    }
  }, [selectedNode, selectedLayer, handleStyleChange]); // Add handleStyleChange dependency

  const handleCenterVertically = useCallback(() => {
    if (!selectedNode || !selectedLayer || !selectedLayer.style) return;
    // Assume fixed node dimensions for now
    const nodeHeight = 180; // TODO: Make this dynamic if node sizes vary
    const layerHeight = parsePixels(selectedLayer.style.height);
    if (layerHeight > 0) {
      const newTop = (nodeHeight - layerHeight) / 2;
      handleStyleChange("top", `${Math.round(newTop)}px`);
    }
  }, [selectedNode, selectedLayer, handleStyleChange]); // Add handleStyleChange dependency

  // --- Render Logic ---

  const renderLayerSpecificEditors = () => {
    if (!selectedNode || !selectedLayer) return null;

    switch (selectedLayer.type) {
      case "title":
      case "footer":
      case "text":
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
            {/* Text formatting is now handled in its own accordion section */}
          </>
        );
      case "media":
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
              <label htmlFor={`layerMediaType-${selectedLayer.id}`}>
                媒体类型:
              </label>
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
              <label htmlFor={`layerObjectFit-${selectedLayer.id}`}>
                适应方式:
              </label>
              <select
                id={`layerObjectFit-${selectedLayer.id}`}
                value={selectedLayer.objectFit ?? "contain"}
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
      case "table":
        return <p>表格编辑功能待实现。</p>;
      case "chart":
        return <p>图表编辑功能待实现。</p>;
      case "background":
        // Background layer might primarily use the 'fills' now
        return <p>背景属性请在下方的“背景”部分编辑。</p>; // Updated text
      case "content-area":
        return <p>内容区域仅用于布局，无特定属性。</p>;
      default:
        return <p>未知图层类型。</p>;
    }
  };

  // Define available blend modes
  const backgroundBlendModes: React.CSSProperties["backgroundBlendMode"][] = [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ];

  return (
    <>
      <h3 className="properties-panel-title">属性</h3> {/* Changed title */}
      {/* Wrap content in a div for padding and scrolling */}
      <div className="properties-panel-content">
        {selectedNode ? (
          <>
            {selectedLayer ? (
              <>
                {/* --- Accordion Start --- */}
                {/* Section: Layer Details */}
                <div className="accordion-section">
                  <button
                    className="accordion-header"
                    onClick={() => toggleSection("details")}
                  >
                    <FontAwesomeIcon
                      icon={
                        openSections.details ? faChevronDown : faChevronRight
                      }
                      className="accordion-icon"
                    />
                    <span>图层</span>
                  </button>
                  {openSections.details && (
                    <div className="accordion-content">
                      <div className="property-group">
                        <label htmlFor={`layerName-${selectedLayer.id}`}>
                          名称:
                        </label>
                        <input
                          type="text"
                          id={`layerName-${selectedLayer.id}`}
                          value={selectedLayer.name}
                          onChange={handleNameChange}
                        />
                      </div>
                      <p className="properties-panel-info">
                        类型: {selectedLayer.type}, ID: {selectedLayer.id}
                      </p>
                    </div>
                  )}
                </div>
                {/* Section: Type Specific */}
                {/* Only render if there are specific editors and it's not the background layer */}
                {renderLayerSpecificEditors() &&
                  selectedLayer.type !== "background" && (
                    <div className="accordion-section">
                      <button
                        className="accordion-header"
                        onClick={() => toggleSection("specific")}
                      >
                        <FontAwesomeIcon
                          icon={
                            openSections.specific
                              ? faChevronDown
                              : faChevronRight
                          }
                          className="accordion-icon"
                        />
                        {/* Title depends on layer type, maybe just "内容" or "媒体"? */}
                        <span>
                          {selectedLayer.type === "media" ? "媒体" : "内容"}
                        </span>
                      </button>
                      {openSections.specific && (
                        <div className="accordion-content">
                          {renderLayerSpecificEditors()}
                        </div>
                      )}
                    </div>
                  )}
                {/* Section: Layout (Position, Size, Z-Index) */}
                <div className="accordion-section">
                  <button
                    className="accordion-header"
                    onClick={() => toggleSection("layout")}
                  >
                    <FontAwesomeIcon
                      icon={
                        openSections.layout ? faChevronDown : faChevronRight
                      }
                      className="accordion-icon"
                    />
                    <span>布局</span>
                  </button>
                  {openSections.layout && (
                    <div className="accordion-content">
                      {/* Extract Position/Size/Z-index from common editors */}
                      <div className="property-group">
                        {/* <h4>位置和大小</h4> */} {/* Title now in header */}
                        <label>Left:</label>
                        <input
                          type="number"
                          // Use parsePixels for value binding
                          value={parsePixels(selectedLayer.style?.left) ?? 0}
                          onChange={(e) =>
                            handleStyleChange("left", e.target.value + "px")
                          }
                        />
                        <label>Top:</label>
                        <input
                          type="number"
                          // Use parsePixels for value binding
                          value={parsePixels(selectedLayer.style?.top) ?? 0}
                          onChange={(e) =>
                            handleStyleChange("top", e.target.value + "px")
                          }
                        />
                        <label>Width:</label>
                        <input
                          type="text"
                          value={selectedLayer.style?.width ?? ""}
                          onChange={(e) =>
                            handleStyleChange("width", e.target.value)
                          }
                          placeholder="e.g., 100px or 50%"
                        />
                        <label>Height:</label>
                        <input
                          type="text"
                          value={selectedLayer.style?.height ?? ""}
                          onChange={(e) =>
                            handleStyleChange("height", e.target.value)
                          }
                          placeholder="e.g., 50px or auto"
                        />
                      </div>
                      <div className="property-group">
                        <label htmlFor={`layerZIndex-${selectedLayer.id}`}>
                          层级 (Z-Index):
                        </label>
                        <input
                          type="number"
                          id={`layerZIndex-${selectedLayer.id}`}
                          value={selectedLayer.style?.zIndex ?? 0}
                          onChange={(e) =>
                            handleStyleChange(
                              "zIndex",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                        />
                      </div>
                      {/* Centering Buttons */}
                      <div className="property-group button-group-align">
                        <button
                          onClick={handleCenterHorizontally}
                          className="align-button"
                        >
                          水平居中
                        </button>
                        <button
                          onClick={handleCenterVertically}
                          className="align-button"
                        >
                          垂直居中
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Section: Text (Only for text-like layers) */}
                {(selectedLayer.type === "text" ||
                  selectedLayer.type === "title" ||
                  selectedLayer.type === "footer") && (
                  <div className="accordion-section">
                    <button
                      className="accordion-header"
                      onClick={() => toggleSection("text")}
                    >
                      <FontAwesomeIcon
                        icon={
                          openSections.text ? faChevronDown : faChevronRight
                        }
                        className="accordion-icon"
                      />
                      <span>文本</span>
                    </button>
                    {openSections.text && (
                      <div className="accordion-content">
                        {renderTextFormatEditors(
                          selectedLayer,
                          selectedNode.id,
                          updateLayerData
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* Section: Background (Replaces Fill) */}
                <div className="accordion-section">
                  <button
                    className="accordion-header"
                    onClick={() => toggleSection("background")}
                  >
                    <FontAwesomeIcon
                      icon={
                        openSections.background ? faChevronDown : faChevronRight
                      }
                      className="accordion-icon"
                    />
                    <span>背景</span>
                  </button>
                  {openSections.background && (
                    <div className="accordion-content">
                      {/* Background Color */}
                      <div className="property-group">
                        <label>背景颜色:</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            className="fill-color-input" // Reuse class
                            value={
                              selectedLayer.style?.backgroundColor
                                ?.toString()
                                .startsWith("#")
                                ? selectedLayer.style.backgroundColor
                                : "#ffffff"
                            } // Handle non-hex values
                            onChange={(e) =>
                              handleStyleChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            title="选择颜色"
                          />
                          <input
                            type="text"
                            className="fill-color-text-input" // Reuse class
                            value={selectedLayer.style?.backgroundColor || ""}
                            onChange={(e) =>
                              handleStyleChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            title="颜色值 (Hex, rgba)"
                          />
                          {/* TODO: Add Opacity slider/input specifically for background color */}
                        </div>
                      </div>
                      {/* Background Image */}
                      <div className="property-group">
                        <label htmlFor={`layerBgImage-${selectedLayer.id}`}>
                          背景图片 URL:
                        </label>
                        <input
                          type="text"
                          id={`layerBgImage-${selectedLayer.id}`}
                          value={
                            selectedLayer.style?.backgroundImage?.replace(
                              /url\(['"]?(.*?)['"]?\)/,
                              "$1"
                            ) ?? ""
                          }
                          onChange={(e) =>
                            handleStyleChange(
                              "backgroundImage",
                              e.target.value
                                ? `url(${e.target.value})`
                                : undefined
                            )
                          }
                          placeholder="输入图片 URL"
                        />
                      </div>
                      {/* Background Position */}
                      <div className="property-group">
                        <label htmlFor={`layerBgPos-${selectedLayer.id}`}>
                          图片位置:
                        </label>
                        <input
                          type="text"
                          id={`layerBgPos-${selectedLayer.id}`}
                          value={selectedLayer.style?.backgroundPosition || ""}
                          onChange={(e) =>
                            handleStyleChange(
                              "backgroundPosition",
                              e.target.value
                            )
                          }
                          placeholder="e.g., center center, 50% 50%, 10px 20px"
                        />
                      </div>
                      {/* Background Size */}
                      <div className="property-group">
                        <label htmlFor={`layerBgSize-${selectedLayer.id}`}>
                          图片尺寸:
                        </label>
                        <select
                          id={`layerBgSize-${selectedLayer.id}`}
                          value={selectedLayer.style?.backgroundSize || "auto"}
                          onChange={(e) =>
                            handleStyleChange("backgroundSize", e.target.value)
                          }
                        >
                          <option value="auto">Auto</option>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          {/* Add option for custom value later */}
                        </select>
                      </div>
                      {/* Background Repeat */}
                      <div className="property-group">
                        <label htmlFor={`layerBgRepeat-${selectedLayer.id}`}>
                          图片重复:
                        </label>
                        <select
                          id={`layerBgRepeat-${selectedLayer.id}`}
                          value={
                            selectedLayer.style?.backgroundRepeat || "repeat"
                          }
                          onChange={(e) =>
                            handleStyleChange(
                              "backgroundRepeat",
                              e.target.value
                            )
                          }
                        >
                          <option value="repeat">Repeat</option>
                          <option value="no-repeat">No Repeat</option>
                          <option value="repeat-x">Repeat X</option>
                          <option value="repeat-y">Repeat Y</option>
                          <option value="space">Space</option>
                          <option value="round">Round</option>
                        </select>
                      </div>
                      {/* Background Blend Mode */}
                      <div className="property-group">
                        <label htmlFor={`layerBgBlend-${selectedLayer.id}`}>
                          混合模式:
                        </label>
                        <select
                          id={`layerBgBlend-${selectedLayer.id}`}
                          value={
                            selectedLayer.style?.backgroundBlendMode || "normal"
                          }
                          onChange={(e) =>
                            handleStyleChange(
                              "backgroundBlendMode",
                              e.target
                                .value as React.CSSProperties["backgroundBlendMode"]
                            )
                          }
                        >
                          {backgroundBlendModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                {/* --- Accordion End --- */}
                {/* Delete Layer Button */}
                <hr className="properties-panel-separator" />{" "}
                {/* Separator before delete */}
                <button
                  onClick={() => {
                    if (selectedNode && selectedLayer) {
                      // Add confirmation dialog
                      if (
                        window.confirm(
                          `确定要删除图层 "${
                            selectedLayer.name || selectedLayer.id
                          }" 吗？`
                        )
                      ) {
                        deleteLayer(selectedNode.id, selectedLayer.id);
                      }
                    }
                  }}
                  className="properties-panel-button delete-layer" /* Use class */
                  // disabled attribute is already removed
                >
                  删除此图层
                </button>
              </>
            ) : (
              <p className="properties-panel-placeholder">
                {" "}
                {/* Use class */}
                请在左侧图层面板选择一个图层进行编辑
              </p>
            )}
            {/* Separator before page actions */}
            <hr className="properties-panel-separator" /> {/* Use class */}
            {/* Node-level actions */}
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="properties-panel-button delete-page" /* Use class */
            >
              删除此页面
            </button>
            <p className="properties-panel-info">
              {" "}
              {/* Use class */}
              页面 ID: {selectedNode.id}
            </p>
          </>
        ) : (
          <p className="properties-panel-placeholder">
            {" "}
            {/* Use class */}
            请在编辑区选中一个页面进行编辑
          </p>
        )}
      </div>
    </>
  );
};

export default PropertiesPanel;
