import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertiesPanel from '../../src/components/PropertiesPanel'; // Corrected path
import { SlideNode, NodeData, SlideLayout } from '../../src/types'; // Corrected path

// Mock data for a selected node
const mockNode: SlideNode = {
  id: 'node-1',
  type: 'slideNode', // Assuming a custom node type or default
  position: { x: 0, y: 0 },
  data: {
    label: '初始标题',
    layout: 'title_content',
    content1: '初始内容 1',
    content2: '',
    content3: '',
    content4: '',
  },
};

describe('PropertiesPanel Component', () => {
  const mockUpdateNodeData = vi.fn();
  const mockDeleteNode = vi.fn();

  // Helper function to render the panel
  const renderPanel = (selectedNode: SlideNode | null) => {
    return render(
      <PropertiesPanel
        selectedNode={selectedNode}
        updateNodeData={mockUpdateNodeData}
        deleteNode={mockDeleteNode}
      />
    );
  };

  beforeEach(() => {
    mockUpdateNodeData.mockClear();
    mockDeleteNode.mockClear();
  });

  it('should display placeholder text when no node is selected', () => {
    renderPanel(null);

    // Check for placeholder text
    expect(screen.getByText(/请在编辑区选中一个页面进行编辑/i)).toBeInTheDocument();

    // Check that form elements are not present
    expect(screen.queryByLabelText(/页面标题/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/布局/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /删除此页面/i })).not.toBeInTheDocument();
  });

  it('should display form with node data when a node is selected', () => {
    renderPanel(mockNode);

    // Check that placeholder text is NOT present
    expect(screen.queryByText(/请在编辑区选中一个页面进行编辑/i)).not.toBeInTheDocument();

    // Check form elements are present and have correct initial values
    const titleInput = screen.getByLabelText(/页面标题/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue(mockNode.data.label);

    const layoutSelect = screen.getByLabelText(/布局/i);
    expect(layoutSelect).toBeInTheDocument();
    expect(layoutSelect).toHaveValue(mockNode.data.layout);

    // Check content area 1 (visible for 'title_content' layout)
    // Note: The label is "内容:" for title_content layout
    const content1Textarea = screen.getByLabelText(/内容:/i);
    expect(content1Textarea).toBeInTheDocument();
    expect(content1Textarea).toHaveValue(mockNode.data.content1);

    // Check that other content areas are NOT visible for 'title_content' layout
    expect(screen.queryByLabelText(/内容 2:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 3:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 4:/i)).not.toBeInTheDocument();

    // Check for node ID display
    expect(screen.getByText(`ID: ${mockNode.id}`)).toBeInTheDocument();

    // Check for delete button
    expect(screen.getByRole('button', { name: /删除此页面/i })).toBeInTheDocument();
  });

  it('should call updateNodeData when title is changed', async () => {
    const user = userEvent.setup();
    renderPanel(mockNode);
    const titleInput = screen.getByLabelText(/页面标题/i);
    const newTitle = '新的标题';

    await user.clear(titleInput); // Clear existing value
    await user.type(titleInput, newTitle);

    // Blur the input to ensure state update potentially triggered on blur is captured
    // Using tab might not always trigger blur in jsdom, but it's a common pattern
    await user.tab();

    // updateNodeData is called on every keystroke in the current implementation
    expect(mockUpdateNodeData).toHaveBeenCalled();
    // Check the last call for the final value
    expect(mockUpdateNodeData).toHaveBeenLastCalledWith(mockNode.id, { label: newTitle });
  });

  it('should call updateNodeData and change visible content areas when layout is changed', async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel(mockNode); // Initial layout: title_content
    const layoutSelect = screen.getByLabelText(/布局/i);

    // Initially, only content1 is visible
    expect(screen.getByLabelText(/内容:/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 2:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 3:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 4:/i)).not.toBeInTheDocument();

    // Change layout to 'title_two_content_vertical'
    await user.selectOptions(layoutSelect, 'title_two_content_vertical');
    expect(mockUpdateNodeData).toHaveBeenCalledTimes(1);
    expect(mockUpdateNodeData).toHaveBeenCalledWith(mockNode.id, { layout: 'title_two_content_vertical' });

    // Rerender with the new layout reflected in the mock node data for visibility check
    const updatedNodeVertical = { ...mockNode, data: { ...mockNode.data, layout: 'title_two_content_vertical' as SlideLayout }};
    rerender(<PropertiesPanel selectedNode={updatedNodeVertical} updateNodeData={mockUpdateNodeData} deleteNode={mockDeleteNode} />);

    // Now content1 and content2 should be visible
    expect(screen.getByLabelText(/内容 1:/i)).toBeInTheDocument(); // Label changes
    expect(screen.getByLabelText(/内容 2:/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 3:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 4:/i)).not.toBeInTheDocument();

    // Change layout to 'title_four_content_grid'
    mockUpdateNodeData.mockClear();
    // Need to re-find select after rerender if its props changed, but here props are static
    await user.selectOptions(screen.getByLabelText(/布局/i), 'title_four_content_grid');
    expect(mockUpdateNodeData).toHaveBeenCalledTimes(1);
    expect(mockUpdateNodeData).toHaveBeenCalledWith(mockNode.id, { layout: 'title_four_content_grid' });

     // Rerender with the new layout
    const updatedNodeGrid = { ...mockNode, data: { ...mockNode.data, layout: 'title_four_content_grid' as SlideLayout }};
    rerender(<PropertiesPanel selectedNode={updatedNodeGrid} updateNodeData={mockUpdateNodeData} deleteNode={mockDeleteNode} />);

    // Now content1, 2, 3, 4 should be visible
    expect(screen.getByLabelText(/内容 1:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/内容 2:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/内容 3:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/内容 4:/i)).toBeInTheDocument();

     // Change layout to 'blank'
    mockUpdateNodeData.mockClear();
    await user.selectOptions(screen.getByLabelText(/布局/i), 'blank');
    expect(mockUpdateNodeData).toHaveBeenCalledTimes(1);
    expect(mockUpdateNodeData).toHaveBeenCalledWith(mockNode.id, { layout: 'blank' });

     // Rerender with the new layout
    const updatedNodeBlank = { ...mockNode, data: { ...mockNode.data, layout: 'blank' as SlideLayout }};
    rerender(<PropertiesPanel selectedNode={updatedNodeBlank} updateNodeData={mockUpdateNodeData} deleteNode={mockDeleteNode} />);

    // No content areas should be visible for 'blank' layout
    expect(screen.queryByLabelText(/内容:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 1:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 2:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 3:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/内容 4:/i)).not.toBeInTheDocument();
  });

  it('should call updateNodeData when content textareas are changed', async () => {
    const user = userEvent.setup();
     // Use a layout where multiple textareas are visible, e.g., title_two_content_vertical
    const initialNode = { ...mockNode, data: { ...mockNode.data, layout: 'title_two_content_vertical' as SlideLayout, content1: 'c1', content2: 'c2' }};
    renderPanel(initialNode);

    const content1Textarea = screen.getByLabelText(/内容 1:/i);
    const content2Textarea = screen.getByLabelText(/内容 2:/i);
    const newContent1 = '新的内容1';
    const newContent2 = '新的内容2';

    // Change content 1
    await user.clear(content1Textarea);
    await user.type(content1Textarea, newContent1);
    await user.tab(); // Blur
    expect(mockUpdateNodeData).toHaveBeenLastCalledWith(mockNode.id, { content1: newContent1 });

    // Change content 2
    // Clear calls from typing in content1 - check how many times it was called before clearing
    const callsBeforeContent2 = mockUpdateNodeData.mock.calls.length;
    mockUpdateNodeData.mockClear();

    await user.clear(content2Textarea);
    await user.type(content2Textarea, newContent2);
    await user.tab(); // Blur
    // Check that it was called for content2 typing + potentially blur
    expect(mockUpdateNodeData).toHaveBeenCalled();
    expect(mockUpdateNodeData).toHaveBeenLastCalledWith(mockNode.id, { content2: newContent2 });
  });

  it('should call deleteNode with the correct node id when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderPanel(mockNode);

    const deleteButton = screen.getByRole('button', { name: /删除此页面/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    expect(mockDeleteNode).toHaveBeenCalledTimes(1);
    expect(mockDeleteNode).toHaveBeenCalledWith(mockNode.id);
  });
});