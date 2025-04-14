import { Node } from 'reactflow';

// Define supported layout types
export type SlideLayout =
  | "title_content"
  | "title_two_content_vertical"
  | "title_two_content_horizontal"
  | "title_four_content_grid"
  | "title_four_content_horizontal"
  | "title_only"
  | "blank";

// Define the structure of the data object within a node
export interface NodeData {
  label: string;
  layout: SlideLayout;
  content1: string;
  content2?: string;
  content3?: string;
  content4?: string;
  width?: number; // For layout calculation
  height?: number; // For layout calculation
}

// Define Node type with specific data structure
export type SlideNode = Node<NodeData>;