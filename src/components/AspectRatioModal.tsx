import React, { useState } from 'react';
import '../styles/AspectRatioModal.css'; // 我们稍后会创建这个 CSS 文件

interface AspectRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (aspectRatio: string) => void; // 回调函数，传递选择的比例
}

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedRatio, setSelectedRatio] = useState<string>('16:9'); // 默认选中 16:9

  if (!isOpen) {
    return null;
  }

  const handleSelect = () => {
    onSelect(selectedRatio); // 调用父组件传递的回调
    onClose(); // 关闭模态框
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* 防止点击内容区关闭 */}
        <h2>选择页面宽高比</h2>
        <div className="ratio-options">
          <button
            className={`ratio-button ${selectedRatio === '16:9' ? 'selected' : ''}`}
            onClick={() => setSelectedRatio('16:9')}
          >
            16:9 (宽屏)
          </button>
          <button
            className={`ratio-button ${selectedRatio === '4:3' ? 'selected' : ''}`}
            onClick={() => setSelectedRatio('4:3')}
          >
            4:3 (标准)
          </button>
           {/* 可以根据需要添加更多比例选项 */}
        </div>
        <div className="modal-actions">
          <button onClick={handleSelect} className="confirm-button">确认</button>
          <button onClick={onClose} className="cancel-button">取消</button>
        </div>
      </div>
    </div>
  );
};

export default AspectRatioModal;