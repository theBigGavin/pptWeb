import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Add the 'open' class conditionally based on the isOpen prop
    <div
      className={`settings-modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="settings-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* Prevent content click from closing */}
        <div className="settings-modal-header">
          <h3>设置</h3>
          <button onClick={onClose} className="settings-modal-close-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="settings-modal-body">
          <p>这里是设置选项...</p>
          {/* Add actual settings controls here later */}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
