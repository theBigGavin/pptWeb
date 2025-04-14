import React from "react";
import { useReactFlow, ControlButton, Controls } from "reactflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrosshairs,
  faPlus,
  faMinus,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { SlideNode } from "../types";

interface CustomControlsProps {
  selectedNode: SlideNode | null;
  viewportSize: { width: number; height: number };
}

const nodeWidth = 320;
const nodeHeight = 180;

const CustomControls: React.FC<CustomControlsProps> = ({
  selectedNode,
  viewportSize,
}) => {
  // Get all necessary functions from useReactFlow
  const {
    setCenter,
    fitView,
    zoomOut,
    getViewport,
    zoomTo,
  } = useReactFlow(); // Removed unused zoomIn

  // --- Focus Node Logic ---
  const onFocusNode = () => {
    const nodeToFocus = selectedNode;
    if (
      nodeToFocus?.position &&
      viewportSize.width > 0 &&
      viewportSize.height > 0
    ) {
      const nodeW = nodeToFocus.width ?? nodeWidth;
      const nodeH = nodeToFocus.height ?? nodeHeight;

      const controlsHeightEstimatePx = 80;
      const horizontalPaddingPx = 40;
      const topPaddingPx = 40;

      const availableWidthPx = viewportSize.width - 2 * horizontalPaddingPx;
      const availableHeightPx =
        viewportSize.height - controlsHeightEstimatePx - topPaddingPx;

      if (availableWidthPx <= 0 || availableHeightPx <= 0) {
        console.warn("Not enough space to focus node with padding.");
        fitView({ duration: 300, padding: 0.2 });
        return;
      }

      const zoomX = availableWidthPx / nodeW;
      const zoomY = availableHeightPx / nodeH;
      const targetZoom = Math.min(zoomX, zoomY);

      const nodeCenterX = nodeToFocus.position.x + nodeW / 2;
      const nodeCenterY = nodeToFocus.position.y + nodeH / 2;

      const nodeHeightPx = nodeH * targetZoom;
      const targetCenterY_screen =
        viewportSize.height - controlsHeightEstimatePx - nodeHeightPx / 2;
      const verticalOffsetPx = targetCenterY_screen - viewportSize.height / 2;
      const verticalOffsetViewport = verticalOffsetPx / targetZoom;
      const adjustedCenterY = nodeCenterY - verticalOffsetViewport;

      setCenter(nodeCenterX, adjustedCenterY, {
        zoom: targetZoom,
        duration: 300,
      });
    } else if (nodeToFocus) {
      console.warn(
        "Viewport size not available or node position missing, using simple fitView."
      );
      fitView({ duration: 300, padding: 0.2 });
    }
  };

  // --- Custom Zoom In Logic ---
  const calculateMaxZoom = (): number => {
    const nodeToCalcFor = selectedNode; // Base max zoom on selected node if available
    const nodeW = nodeToCalcFor?.width ?? nodeWidth;
    const nodeH = nodeToCalcFor?.height ?? nodeHeight;

    const controlsHeightEstimatePx = 80;
    const horizontalPaddingPx = 40;
    const topPaddingPx = 40;

    // Ensure viewportSize is valid before calculation
    if (!viewportSize || viewportSize.width <= 0 || viewportSize.height <= 0)
      return 2; // Default max zoom

    const availableWidthPx = viewportSize.width - 2 * horizontalPaddingPx;
    const availableHeightPx =
      viewportSize.height - controlsHeightEstimatePx - topPaddingPx;

    if (availableWidthPx <= 0 || availableHeightPx <= 0) {
      return 2; // Default max zoom if calculation fails
    }

    const zoomX = availableWidthPx / nodeW;
    const zoomY = availableHeightPx / nodeH;
    // Return a slightly smaller zoom than calculated to ensure padding
    return Math.min(zoomX, zoomY) * 0.98;
  };

  const onCustomZoomIn = () => {
    const currentZoom = getViewport().zoom;
    const maxZoom = calculateMaxZoom();
    const nextZoom = Math.min(currentZoom * 1.2, maxZoom);
    zoomTo(nextZoom, { duration: 200 });
  };

  // --- Custom Fit View ---
  // Use default fitView but with consistent padding/duration
  const onCustomFitView = () => fitView({ duration: 300, padding: 0.1 });

  // --- Custom Zoom Out ---
  const onCustomZoomOut = () => zoomOut({ duration: 300 });

  // --- Render ---
  return (
    <Controls
      position="bottom-center"
      showZoom={false} // Hide default zoom
      showFitView={false} // Hide default fit view
      showInteractive={true} // Keep default lock
    >
      {/* Custom Buttons */}
      <ControlButton onClick={onCustomZoomIn} title="Zoom In">
        <FontAwesomeIcon icon={faPlus} />
      </ControlButton>
      <ControlButton onClick={onCustomZoomOut} title="Zoom Out">
        <FontAwesomeIcon icon={faMinus} />
      </ControlButton>
      <ControlButton onClick={onCustomFitView} title="Fit View">
        <FontAwesomeIcon icon={faExpand} />
      </ControlButton>
      <ControlButton
        onClick={onFocusNode}
        title="Focus Selected Node"
        disabled={!selectedNode}
      >
        <FontAwesomeIcon icon={faCrosshairs} />
      </ControlButton>
    </Controls>
  );
};

export default CustomControls;
