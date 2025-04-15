import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toolbar from '../../src/components/Toolbar'; // Corrected path

describe('Toolbar Component', () => {
  const mockAddSlide = vi.fn();
  const mockExportToPptx = vi.fn();
  const mockOnAutoLayout = vi.fn();

  // Helper function to render the toolbar
  const renderToolbar = () => {
    return render(
      <Toolbar
        addSlide={mockAddSlide}
        exportToPptx={mockExportToPptx}
        onAutoLayout={mockOnAutoLayout}
      />
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockAddSlide.mockClear();
    mockExportToPptx.mockClear();
    mockOnAutoLayout.mockClear();
    // Mock window.alert for tests that trigger it
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  // Restore mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render collapsed initially with all buttons', () => {
    renderToolbar();

    // Check if toolbar container is collapsed by finding the container div
    const toolbarContainer = screen.getByRole('heading', { name: /工具栏/i }).closest('.toolbar-container');
    expect(toolbarContainer).toHaveClass('collapsed');

    // Check for title
    expect(screen.getByRole('heading', { name: /工具栏/i })).toBeInTheDocument();

    // Check for specific buttons by text content within the button
    expect(screen.getByRole('button', { name: /新建 PPT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /添加页面/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /自动布局/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /设计风格/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /图片资源/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全屏预览/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /导出 PPTX/i })).toBeInTheDocument();

    // Check for the toggle button (initially showing right arrow) by its title
    const toggleButton = screen.getByTitle(/展开工具栏/i);
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton.querySelector('svg[data-icon="chevron-right"]')).toBeInTheDocument();
  });

  it('should toggle collapse state when toggle button is clicked', async () => {
    const user = userEvent.setup();
    renderToolbar();

    const toolbarContainer = screen.getByRole('heading', { name: /工具栏/i }).closest('.toolbar-container');
    let toggleButton = screen.getByTitle(/展开工具栏/i);

    // Initial state: collapsed
    expect(toolbarContainer).toHaveClass('collapsed');
    expect(toggleButton.querySelector('svg[data-icon="chevron-right"]')).toBeInTheDocument();

    // Click to expand
    await user.click(toggleButton);
    expect(toolbarContainer).not.toHaveClass('collapsed');
    // Toggle button title and icon should change
    toggleButton = screen.getByTitle(/折叠工具栏/i); // Find button by new title
    expect(toggleButton.querySelector('svg[data-icon="chevron-left"]')).toBeInTheDocument();

    // Click to collapse again
    await user.click(toggleButton);
    expect(toolbarContainer).toHaveClass('collapsed');
    // Toggle button title and icon should revert
    toggleButton = screen.getByTitle(/展开工具栏/i); // Find button by original title
    expect(toggleButton.querySelector('svg[data-icon="chevron-right"]')).toBeInTheDocument();
  });

  it('should call correct prop functions when corresponding buttons are clicked', async () => {
    const user = userEvent.setup();
    renderToolbar();

    // Test '添加页面' button
    const addSlideButton = screen.getByRole('button', { name: /添加页面/i });
    await user.click(addSlideButton);
    expect(mockAddSlide).toHaveBeenCalledTimes(1);

    // Test '自动布局' button
    const autoLayoutButton = screen.getByRole('button', { name: /自动布局/i });
    await user.click(autoLayoutButton);
    expect(mockOnAutoLayout).toHaveBeenCalledTimes(1);

    // Test '导出 PPTX' button
    const exportButton = screen.getByRole('button', { name: /导出 PPTX/i });
    await user.click(exportButton);
    expect(mockExportToPptx).toHaveBeenCalledTimes(1);
  });

  it('should call window.alert for unimplemented features', async () => {
    const user = userEvent.setup();
    renderToolbar();

    // Test '新建 PPT' button
    const newPptButton = screen.getByRole('button', { name: /新建 PPT/i });
    await user.click(newPptButton);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('功能待实现: 新建 PPT');

    // Test '设计风格' button
    vi.mocked(window.alert).mockClear(); // Clear previous calls
    const designButton = screen.getByRole('button', { name: /设计风格/i });
    await user.click(designButton);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('功能待实现: 设计风格');

    // Test '图片资源' button
    vi.mocked(window.alert).mockClear();
    const imageButton = screen.getByRole('button', { name: /图片资源/i });
    await user.click(imageButton);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('功能待实现: 免费图片资源');

    // Test '全屏预览' button
    vi.mocked(window.alert).mockClear();
    const previewButton = screen.getByRole('button', { name: /全屏预览/i });
    await user.click(previewButton);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('功能待实现: 全屏预览');
  });
});