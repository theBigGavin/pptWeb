import { Node } from 'reactflow';
import React from 'react'; // Import React for CSSProperties

// --- Core Layer Definitions ---

// 1. Define all supported layer types
export type LayerType =
  | 'background' // Represents the slide background (color or image)
  | 'title'      // Dedicated title text area
  | 'content-area' // Defines a region where content layers reside (optional, for layout structure)
  | 'footer'     // Dedicated footer text area
  | 'text'       // A general text box
  | 'media'      // For images, videos, animations
  | 'table'      // For tabular data
  | 'chart';     // For charts (rendered as images eventually)

// 2. Define base properties common to all layers
export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string; // User-friendly name for the layer panel
  style: React.CSSProperties; // Includes position (left, top), size (width, height), zIndex, background, etc.
}

// 3. Define auxiliary types for complex properties
export interface TextFormat {
  fontSize?: string | number;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string; // e.g., 'underline', 'line-through'
  fontFamily?: string;
  lineHeight?: string | number;
  // Add more text formatting options as needed
}

export interface TableStyle {
  border?: string;
  cellPadding?: string | number;
  // Add more table styling options
}

// 4. Define specific layer types inheriting BaseLayer
export interface BackgroundLayer extends BaseLayer {
  type: 'background';
  // Background is primarily controlled by style.backgroundColor or style.backgroundImage
  // No extra content needed here, but could add properties like 'gradient' later
}

export interface TitleLayer extends BaseLayer {
  type: 'title';
  content: string;
  textFormat?: TextFormat;
}

export interface ContentAreaLayer extends BaseLayer {
  type: 'content-area';
  // Primarily defines a bounding box via style. No specific content.
}

export interface FooterLayer extends BaseLayer {
  type: 'footer';
  content: string;
  textFormat?: TextFormat;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  textFormat?: TextFormat;
}

export interface MediaLayer extends BaseLayer {
  type: 'media';
  mediaType: 'image' | 'video' | 'animation'; // Specify the kind of media
  url: string; // URL to the media asset
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  altText?: string; // For accessibility
}

export interface TableLayer extends BaseLayer {
  type: 'table';
  // Define a flexible structure for table data
  tableData: {
    headers: string[];
    rows: (string | number)[][];
  };
  tableStyle?: TableStyle;
}

export interface ChartLayer extends BaseLayer {
  type: 'chart';
  chartType: string; // e.g., 'bar', 'line', 'pie'
  chartData: any; // Data structure depends on the charting library used
  chartOptions?: any; // Options specific to the charting library
}

// 5. Create the discriminated union type for Layer
export type Layer =
  | BackgroundLayer
  | TitleLayer
  | ContentAreaLayer
  | FooterLayer
  | TextLayer
  | MediaLayer
  | TableLayer
  | ChartLayer;

// --- Node Data Definition ---

// 6. Update NodeData to use the new Layer structure
export interface NodeData {
  label: string; // Slide title/name (used in Flow node & LayerPanel root)
  layers: Layer[]; // The core data defining the slide's content and appearance
  // Remove width/height if they are now implicitly defined by a background layer or canvas size
  // width?: number;
  // height?: number;
}

// 7. Keep the SlideNode type definition
export type SlideNode = Node<NodeData>;

// 8. Keep the Theme type definition
export type Theme = 'light' | 'dark' | 'system';