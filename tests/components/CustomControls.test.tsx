import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactFlowProvider, useReactFlow } from 'reactflow'; // Keep reactflow import for Provider
import CustomControls from '../../src/components/CustomControls'; // Corrected path
import { SlideNode } from '../../src/types'; // Corrected path

// Mock the useReactFlow hook
const mockSetCenter = vi.fn();
const mockFitView = vi.fn();
const mockZoomOut = vi.fn();
const mockGetViewport = vi.fn(() => ({ x: 0, y: 0, zoom: 1 })); // Default viewport
const mockZoomTo = vi.fn();

vi.mock('reactflow', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original, // Keep original exports
    useReactFlow: () => ({
      setCenter: mockSetCenter,
      fitView: mockFitView,
      zoomOut: mockZoomOut,
      getViewport: mockGetViewport,
      zoomTo: mockZoomTo,
      // Add other functions if needed by the component, even if not used in tests yet
      project: vi.fn((pos) => pos), // Simple identity function for project
      zoomIn: vi.fn(), // Mock zoomIn even if not directly used by CustomControls
      setViewport: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      // ... add other exports if necessary
    }),
  };
});

// Mock data
const mockSelectedNode: SlideNode = {
  id: 'node-1',
  type: 'slideNode',
  position: { x: 100, y: 50 },
  width: 320, // Add width (using default from component)
  height: 180, // Add height (using default from component)
  data: {
    label: 'Node 1',
    layout: 'title_content',
    content1: '', // Add missing property
    content2: '', // Add missing property
    content3: '', // Add missing property
    content4: '', // Add missing property
  }
};
const mockViewportSize = { width: 800, height: 600 };

describe('CustomControls Component', () => {

  // Helper to render within Provider
  const renderControls = (selectedNode: SlideNode | null) => {
    return render(
      <ReactFlowProvider>
        <CustomControls selectedNode={selectedNode} viewportSize={mockViewportSize} />
      </ReactFlowProvider>
    );
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockSetCenter.mockClear();
    mockFitView.mockClear();
    mockZoomOut.mockClear();
    mockGetViewport.mockClear().mockReturnValue({ x: 0, y: 0, zoom: 1 }); // Reset viewport mock too
    mockZoomTo.mockClear();
  });

  it('should render all control buttons', () => {
    renderControls(null); // Render without selected node initially

    expect(screen.getByTitle(/Zoom In/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Zoom Out/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Fit View/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Focus Selected Node/i)).toBeInTheDocument();
  });

  it('should disable focus button when no node is selected', () => {
    renderControls(null);
    expect(screen.getByTitle(/Focus Selected Node/i)).toBeDisabled();
  });

  it('should enable focus button when a node is selected', () => {
    renderControls(mockSelectedNode);
    expect(screen.getByTitle(/Focus Selected Node/i)).toBeEnabled();
  });

  it('should call zoomTo with increased zoom level when zoom in button is clicked', async () => {
    const user = userEvent.setup();
    renderControls(null); // Node selection doesn't affect zoom in

    // Mock getViewport to return a specific zoom level
    mockGetViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 });

    const zoomInButton = screen.getByTitle(/Zoom In/i);
    await user.click(zoomInButton);

    // Calculate expected zoom (current * 1.2, capped by maxZoom calculation)
    // Max zoom calculation depends on viewport and node size (using defaults here)
    const nodeW = 320;
    const nodeH = 180;
    const controlsHeightEstimatePx = 80;
    const horizontalPaddingPx = 40;
    const topPaddingPx = 40;
    const availableWidthPx = mockViewportSize.width - 2 * horizontalPaddingPx; // 800 - 80 = 720
    const availableHeightPx = mockViewportSize.height - controlsHeightEstimatePx - topPaddingPx; // 600 - 80 - 40 = 480
    const zoomX = availableWidthPx / nodeW; // 720 / 320 = 2.25
    const zoomY = availableHeightPx / nodeH; // 480 / 180 = 2.66...
    const calculatedMaxZoom = Math.min(zoomX, zoomY) * 0.98; // 2.25 * 0.98 = 2.205
    const expectedZoom = Math.min(1 * 1.2, calculatedMaxZoom); // min(1.2, 2.205) = 1.2

    expect(mockZoomTo).toHaveBeenCalledTimes(1);
    expect(mockZoomTo).toHaveBeenCalledWith(expectedZoom, { duration: 200 });
  });

  it('should call zoomOut when zoom out button is clicked', async () => {
    const user = userEvent.setup();
    renderControls(null);
    const zoomOutButton = screen.getByTitle(/Zoom Out/i);
    await user.click(zoomOutButton);
    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).toHaveBeenCalledWith({ duration: 300 });
  });

  it('should call fitView when fit view button is clicked', async () => {
    const user = userEvent.setup();
    renderControls(null);
    const fitViewButton = screen.getByTitle(/Fit View/i);
    await user.click(fitViewButton);
    expect(mockFitView).toHaveBeenCalledTimes(1);
    expect(mockFitView).toHaveBeenCalledWith({ duration: 300, padding: 0.1 });
  });

  it('should call setCenter with calculated values when focus button is clicked', async () => {
    const user = userEvent.setup();
    renderControls(mockSelectedNode); // Render with a selected node

    const focusButton = screen.getByTitle(/Focus Selected Node/i);
    await user.click(focusButton);

    // Calculate expected values based on onFocusNode logic
    const nodeW = mockSelectedNode.width ?? 320;
    const nodeH = mockSelectedNode.height ?? 180;
    const controlsHeightEstimatePx = 80;
    const horizontalPaddingPx = 40;
    const topPaddingPx = 40;
    const availableWidthPx = mockViewportSize.width - 2 * horizontalPaddingPx; // 720
    const availableHeightPx = mockViewportSize.height - controlsHeightEstimatePx - topPaddingPx; // 480
    const zoomX = availableWidthPx / nodeW; // 720 / 320 = 2.25
    const zoomY = availableHeightPx / nodeH; // 480 / 180 = 2.66...
    const targetZoom = Math.min(zoomX, zoomY); // 2.25

    const nodeCenterX = mockSelectedNode.position.x + nodeW / 2; // 100 + 160 = 260
    const nodeCenterY = mockSelectedNode.position.y + nodeH / 2; // 50 + 90 = 140

    const nodeHeightPx = nodeH * targetZoom; // 180 * 2.25 = 405
    const targetCenterY_screen = mockViewportSize.height - controlsHeightEstimatePx - nodeHeightPx / 2; // 600 - 80 - 405 / 2 = 520 - 202.5 = 317.5
    const verticalOffsetPx = targetCenterY_screen - mockViewportSize.height / 2; // 317.5 - 300 = 17.5
    const verticalOffsetViewport = verticalOffsetPx / targetZoom; // 17.5 / 2.25 = 7.77...
    const adjustedCenterY = nodeCenterY - verticalOffsetViewport; // 140 - 7.77... = 132.22...

    expect(mockSetCenter).toHaveBeenCalledTimes(1);
    // Use closeTo for floating point comparisons
    expect(mockSetCenter).toHaveBeenCalledWith(
      nodeCenterX, // 260
      expect.closeTo(adjustedCenterY), // ~132.22
      { zoom: targetZoom, duration: 300 } // zoom: 2.25
    );
  });
});