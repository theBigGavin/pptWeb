import React from 'react';

// Define the props type, including the addSlide and export function
interface ToolbarProps {
  addSlide: () => void;
  exportToPptx: () => void; // Add the export function prop
}

const Toolbar: React.FC<ToolbarProps> = ({ addSlide, exportToPptx }) => { // Destructure the new prop
  return (
    <div className="toolbar-container">
      <h2 className="toolbar-title">工具栏</h2>
      <ul className="toolbar-menu">
        <li>
          <button className="toolbar-button" onClick={() => alert('功能待实现: 新建 PPT')}>
            {/* Placeholder for Icon */}
            <span>新建 PPT</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={addSlide}>
            {/* Placeholder for Icon */}
            <span>添加页面</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={() => alert('功能待实现: 设计风格')}>
            {/* Placeholder for Icon */}
            <span>设计风格</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={() => alert('功能待实现: 免费图片资源')}>
            {/* Placeholder for Icon */}
            <span>图片资源</span>
          </button>
        </li>
        <li>
          <button className="toolbar-button" onClick={exportToPptx}>
            {/* Placeholder for Icon */}
            <span>导出 PPTX</span>
          </button>
        </li>
        {/* Add more tools as needed */}
      </ul>
    </div>
  );
};

export default Toolbar;