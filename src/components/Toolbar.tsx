import React, { useState } from "react"; // Import useState
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faPlus,
  faWandMagicSparkles,
  faPalette,
  faImage,
  faDesktop,
  faSave,
  // faChevronLeft, // Removed unused
  // faChevronRight, // Removed unused
  faBars, // Import faBars icon
} from "@fortawesome/free-solid-svg-icons";

// Define the props type, including the addSlide and export function
interface ToolbarProps {
  addSlide: () => void;
  exportToPptx: () => void;
  onAutoLayout: () => void; // Add the auto layout function prop
}

const Toolbar: React.FC<ToolbarProps> = ({
  addSlide,
  exportToPptx,
  onAutoLayout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`toolbar-container ${isCollapsed ? "collapsed" : ""}`}>
      {/* <h2 className="toolbar-title">工具栏</h2> */} {/* Title is hidden via CSS */}
      
      {/* Menu is always visible, collapse state controlled by CSS */}
      <ul className="toolbar-menu">
        {/* Reordered Menu Items */}
        <li>
          <button
            className="toolbar-button"
            onClick={() => alert("功能待实现: 新建 PPT")}
          >
            <FontAwesomeIcon
              icon={faFile}
              className="toolbar-icon"
              title="新建 PPT"
            />
            <span>新建 PPT</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={addSlide}>
            <FontAwesomeIcon
              icon={faPlus}
              className="toolbar-icon"
              title="添加页面"
            />
            <span>添加页面</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={onAutoLayout}>
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="toolbar-icon"
            />
            <span>自动布局</span>
          </button>
        </li>
        <li>
          <button
            className="toolbar-button"
            onClick={() => alert("功能待实现: 设计风格")}
          >
            <FontAwesomeIcon
              icon={faPalette}
              className="toolbar-icon"
              title="设计风格"
            />
            <span>设计风格</span>
          </button>
        </li>
        <li>
          <button
            className="toolbar-button"
            onClick={() => alert("功能待实现: 免费图片资源")}
          >
            <FontAwesomeIcon
              icon={faImage}
              className="toolbar-icon"
              title="图片资源"
            />
            <span>图片资源</span>
          </button>
        </li>
        <li>
          <button
            className="toolbar-button"
            onClick={() => alert("功能待实现: 全屏预览")}
          >
            <FontAwesomeIcon
              icon={faDesktop}
              className="toolbar-icon"
              title="全屏预览"
            />
            <span>全屏预览</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={exportToPptx}>
            <FontAwesomeIcon
              icon={faSave}
              className="toolbar-icon"
              title="导出 PPTX"
            />
            <span>导出 PPTX</span>
          </button>
        </li>
        {/* Add more tools as needed */}
      </ul>
      {/* Toggle button always visible */}
      <button
        onClick={toggleCollapse}
        className="toolbar-toggle-button"
        title={isCollapsed ? "展开工具栏" : "折叠工具栏"}
      >
        <FontAwesomeIcon icon={faBars} /> {/* Use faBars icon */}
      </button>
    </div>
  );
};

export default Toolbar;
