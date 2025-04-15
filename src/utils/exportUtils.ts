import PptxGenJS from "pptxgenjs";
import { SlideNode, Layer, TextLayer, TitleLayer, FooterLayer, MediaLayer, /*TableLayer,*/ /*ChartLayer,*/ BackgroundLayer } from '../types'; // Import necessary types, removed unused TableLayer, ChartLayer
import { getNodesInOrder } from './nodeUtils'; // Import node ordering function
import { Edge } from "reactflow";

export const exportPresentation = (nodes: SlideNode[], edges: Edge[]) => {
  if (nodes.length === 0) {
    alert("没有可导出的页面！");
    return;
  }

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";

  // Get nodes in order based on connections
  const orderedNodes = getNodesInOrder(nodes, edges);

  // Helper function to parse CSS values (px or %) and convert to inches or percentage for PptxGenJS
  const parseUnitValue = (value: string | number | undefined, baseDimensionPx: number, slideDimensionInch: number): number | string => {
      if (typeof value === 'string') {
          if (value.endsWith('%')) {
              return value; // PptxGenJS accepts percentages directly
          } else if (value.endsWith('px')) {
              const px = parseFloat(value);
              return (px / baseDimensionPx) * slideDimensionInch;
          } else if (!isNaN(parseFloat(value))) {
              // Assume pixels if unit is missing but parsable as number
              const px = parseFloat(value);
              return (px / baseDimensionPx) * slideDimensionInch;
          }
      } else if (typeof value === 'number') {
          // Assume pixels if it's just a number
          return (value / baseDimensionPx) * slideDimensionInch;
      }
      // Fallback for undefined or unparsable values
      return 0; // Or return a default size/position?
  };

  // Constants for conversion (assuming node size represents slide size)
  const NODE_WIDTH_PX = 320;
  const NODE_HEIGHT_PX = 180;
  const SLIDE_WIDTH_INCH = 10; // For 16:9 layout
  const SLIDE_HEIGHT_INCH = 5.625; // For 16:9 layout

  orderedNodes.forEach((node) => {
    const slide = pptx.addSlide();
    const { data } = node;
    const layers = data?.layers || [];

    // Sort layers by zIndex (ascending)
    const sortedLayers = [...layers].sort((a, b) => {
        const zA = typeof a.style?.zIndex === 'number' ? a.style.zIndex : 0;
        const zB = typeof b.style?.zIndex === 'number' ? b.style.zIndex : 0;
        return zA - zB;
    });

    sortedLayers.forEach((layer: Layer) => {
        // Handle background layer first
        if (layer.type === 'background') {
            const bgLayer = layer as BackgroundLayer;
            const backgroundOptions: PptxGenJS.BackgroundProps = {};
            if (bgLayer.style?.backgroundColor) {
                backgroundOptions.color = bgLayer.style.backgroundColor.replace('#', '');
            }
            if (bgLayer.style?.backgroundImage) {
                const urlMatch = bgLayer.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    backgroundOptions.path = urlMatch[1]; // Use path for image URLs
                }
            }
            if (Object.keys(backgroundOptions).length > 0) {
                slide.background = backgroundOptions;
            }
            return; // Skip further processing for background layer
        }

        // Skip content-area layers
        if (layer.type === 'content-area') {
            return;
        }

        // Calculate position and size for PptxGenJS
        const x = parseUnitValue(layer.style?.left, NODE_WIDTH_PX, SLIDE_WIDTH_INCH);
        const y = parseUnitValue(layer.style?.top, NODE_HEIGHT_PX, SLIDE_HEIGHT_INCH);
        const w = parseUnitValue(layer.style?.width, NODE_WIDTH_PX, SLIDE_WIDTH_INCH);
        const h = parseUnitValue(layer.style?.height, NODE_HEIGHT_PX, SLIDE_HEIGHT_INCH);

        // Base options for elements
        const baseOptions: PptxGenJS.ShapeProps = { x: x as PptxGenJS.Coord, y: y as PptxGenJS.Coord, w: w as PptxGenJS.Coord, h: h as PptxGenJS.Coord };

        // Add fill color if present (for shapes that support it, like text boxes)
        if (layer.style?.backgroundColor && layer.style.backgroundColor !== 'transparent') {
             baseOptions.fill = { color: layer.style.backgroundColor.replace('#', '') };
        }

        switch (layer.type) {
            case 'title':
            case 'text':
            case 'footer': {
                const textLayer = layer as TextLayer | TitleLayer | FooterLayer;
                const textOptions: PptxGenJS.TextPropsOptions = { ...baseOptions };

                // Map textFormat properties
                if (textLayer.textFormat) {
                    if (textLayer.textFormat.fontSize) textOptions.fontSize = parseFloat(String(textLayer.textFormat.fontSize).replace('px', '').replace('em', '')) || 12; // Basic parsing
                    if (textLayer.textFormat.color) textOptions.color = textLayer.textFormat.color.replace('#', '');
                    if (textLayer.textFormat.fontWeight) textOptions.bold = ['bold', '600', '700', '800', '900'].includes(String(textLayer.textFormat.fontWeight).toLowerCase());
                    if (textLayer.textFormat.fontStyle === 'italic') textOptions.italic = true;
                    if (textLayer.textFormat.textAlign) textOptions.align = textLayer.textFormat.textAlign;
                    if (textLayer.textFormat.fontFamily) textOptions.fontFace = textLayer.textFormat.fontFamily;
                    if (textLayer.textFormat.textDecoration?.includes('underline')) textOptions.underline = { style: 'sng' }; // Use object for underline
                    // lineSpacing can be mapped from lineHeight if needed
                }

                slide.addText(textLayer.content || '', textOptions);
                break;
            }
            case 'media': {
                const mediaLayer = layer as MediaLayer;
                if (mediaLayer.url) {
                    const mediaOptions: PptxGenJS.ImageProps | PptxGenJS.MediaProps = {
                        ...baseOptions,
                        path: mediaLayer.url,
                    };
                    if (mediaLayer.mediaType === 'image') {
                        // objectFit is harder to map directly, sizing='contain' or 'cover' might be closest
                        if (mediaLayer.objectFit) {
                            (mediaOptions as PptxGenJS.ImageProps).sizing = { type: mediaLayer.objectFit as 'contain' | 'cover', w: w as number, h: h as number };
                        }
                        slide.addImage(mediaOptions as PptxGenJS.ImageProps);
                    } else if (mediaLayer.mediaType === 'video') {
                        (mediaOptions as PptxGenJS.MediaProps).type = 'video';
                        slide.addMedia(mediaOptions as PptxGenJS.MediaProps);
                    }
                }
                break;
            }
            case 'table': {
                // const tableLayer = layer as TableLayer;
                // Basic placeholder, full table generation would be complex
                slide.addText('[Table Placeholder]', { ...baseOptions, align: 'center', valign: 'middle', fontSize: 10, color: '666666' });
                break;
            }
            case 'chart': {
                // const chartLayer = layer as ChartLayer;
                // Basic placeholder
                slide.addText('[Chart Placeholder]', { ...baseOptions, align: 'center', valign: 'middle', fontSize: 10, color: '666666' });
                break;
            }
            default:
                console.warn(`Unsupported layer type for export: ${(layer as any).type}`); // Cast to any for warning
                break;
        }
    });
  });

  pptx.writeFile({ fileName: "MyPresentation.pptx" })
    .then(() => console.log("Presentation exported successfully."))
    .catch(err => console.error("Error exporting presentation:", err));
};