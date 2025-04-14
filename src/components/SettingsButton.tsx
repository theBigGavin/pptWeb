import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import SettingsModal from "./SettingsModal"; // Import the modal

const SettingsButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleButtonClick = () => {
    setIsSpinning(true); // Start spinning
    setIsModalOpen(true); // Open modal

    // Remove spinning class after animation duration (e.g., 500ms)
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={`settings-button ${isSpinning ? "spin" : ""}`}
        onClick={handleButtonClick}
        title="设置"
      >
        <FontAwesomeIcon icon={faCog} />
      </button>
      <SettingsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default SettingsButton;
