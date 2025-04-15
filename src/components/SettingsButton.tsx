import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import SettingsModal from "./SettingsModal";
import { Theme } from "../types"; // Import Theme type

// Define props for SettingsButton
interface SettingsButtonProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ currentTheme, onThemeChange }) => { // Destructure props
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
      {/* Pass theme props down to SettingsModal */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
      />
    </>
  );
};

export default SettingsButton;
