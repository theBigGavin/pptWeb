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
  // Use React.CSSProperties, which includes standard background properties.
  // Add specific optional types if needed for stricter checking or less common props.
  style: React.CSSProperties & {
    // Explicitly allow background blend mode if not already in CSSProperties type
    backgroundBlendMode?: React.CSSProperties['backgroundBlendMode'];
    // Add other less common properties if needed
  };
  // Removed fills array: fills?: FillLayer[];
}

// 3. Define auxiliary types for complex properties
export interface TextFormat {
  fontSize?: string | number;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string; // e.g., 'italic'
  textAlign?: 'left' | 'center' | 'right' | 'justify'; // Horizontal alignment
  verticalAlign?: 'flex-start' | 'center' | 'flex-end'; // Vertical alignment (using flexbox)
  textDecoration?: string; // e.g., 'underline', 'line-through'
  fontFamily?: string; // Font family name
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
  // Use a more specific type than 'any' if possible, otherwise use a general object/array type
  chartData: Record<string, unknown> | unknown[]; // Data structure depends on the charting library used
  chartOptions?: Record<string, unknown>; // Options specific to the charting library
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
  width?: number; // Optional width, passed in data for direct use by SlideNode
  height?: number; // Optional height, passed in data for direct use by SlideNode
}

// 7. Keep the SlideNode type definition
export type SlideNode = Node<NodeData>;

// 8. Keep the Theme type definition
export type Theme = 'light' | 'dark' | 'system';