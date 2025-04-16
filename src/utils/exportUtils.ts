import PptxGenJS from "pptxgenjs";
import { SlideNode, Layer, TextLayer, TitleLayer, FooterLayer, MediaLayer, /*TableLayer,*/ /*ChartLayer,*/ BackgroundLayer } from '../types'; // Import necessary types, removed unused TableLayer, ChartLayer
import { getNodesInOrder } from './nodeUtils'; // Import node ordering function
import { Edge } from "reactflow";

// Helper function to fetch image and convert to Base64
// Returns null on error (e.g., CORS or network issue)
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    // Try fetching with CORS mode. This might still fail if the server doesn't allow it.
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      // Try fetching via a CORS proxy as a fallback (if available)
      // Example using cors-anywhere (replace with your own proxy if needed)
      // const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      // console.warn(`Direct fetch failed for ${url}, trying proxy...`);
      // response = await fetch(proxyUrl);
      // if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
      // }
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to fetch or convert image to Base64: ${url}`, error);
    return null; // Return null if fetching/conversion fails
  }
};


export const exportPresentation = async (nodes: SlideNode[], edges: Edge[]) => {
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

  // Constants for slide dimensions (inches for 16:9 layout)
  const SLIDE_WIDTH_INCH = 10;
  const SLIDE_HEIGHT_INCH = 5.625;

  // Use Promise.all to handle async operations for each slide
  await Promise.all(orderedNodes.map(async (node) => {
    const slide = pptx.addSlide();
    const { data } = node;
    const layers = data?.layers || [];

    // Get the actual dimensions of the current node (used as base for px/% conversion)
    // Use fallback values matching the creation logic in App.tsx if node dimensions are missing
    const nodeWidthPx = node.width ?? 600;
    const nodeHeightPx = node.height ?? (nodeWidthPx * (9 / 16)); // Assume 16:9 if height missing

    // Sort layers by zIndex (ascending)
    const sortedLayers = [...layers].sort((a, b) => {
        const zA = typeof a.style?.zIndex === 'number' ? a.style.zIndex : 0;
        const zB = typeof b.style?.zIndex === 'number' ? b.style.zIndex : 0;
        return zA - zB;
    });

    console.log(`Processing Node ID: ${node.id} (Width: ${nodeWidthPx}px, Height: ${nodeHeightPx}px)`); // Log node info

    // Process layers sequentially or use Promise.all if multiple async ops per slide
    for (const layer of sortedLayers) {
        console.log(`-- Processing Layer ID: ${layer.id}, Type: ${layer.type}, Style:`, layer.style); // Log layer info

        // Handle background layer first (assuming background images might also be external)
        if (layer.type === 'background') {
            const bgLayer = layer as BackgroundLayer;
            const backgroundOptions: PptxGenJS.BackgroundProps = {};
            if (bgLayer.style?.backgroundColor) {
                backgroundOptions.color = bgLayer.style.backgroundColor.replace('#', '');
            }
            if (bgLayer.style?.backgroundImage) {
                const urlMatch = bgLayer.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const imageUrl = urlMatch[1];
                    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                        const base64Data = await imageUrlToBase64(imageUrl);
                        if (base64Data) {
                            backgroundOptions.data = base64Data; // Use data for Base64
                        } else {
                            console.warn(`Could not load background image (CORS?): ${imageUrl}`);
                            // Optionally add a placeholder color or skip background
                        }
                    } else {
                         backgroundOptions.path = imageUrl; // Use path for local/relative URLs
                    }
                }
            }
            if (Object.keys(backgroundOptions).length > 0) {
                console.log(`---- Setting background:`, backgroundOptions);
                slide.background = backgroundOptions;
            }
            continue; // Use continue to skip to the next layer in the loop
        }

        // Skip content-area layers
        if (layer.type === 'content-area') {
            return;
        }

        // Calculate position and size for PptxGenJS using the actual node dimensions
        const x = parseUnitValue(layer.style?.left, nodeWidthPx, SLIDE_WIDTH_INCH);
        const y = parseUnitValue(layer.style?.top, nodeHeightPx, SLIDE_HEIGHT_INCH);
        const w = parseUnitValue(layer.style?.width, nodeWidthPx, SLIDE_WIDTH_INCH);
        const h = parseUnitValue(layer.style?.height, nodeHeightPx, SLIDE_HEIGHT_INCH);

        // Base options for elements
        const baseOptions: PptxGenJS.ShapeProps = { x: x as PptxGenJS.Coord, y: y as PptxGenJS.Coord, w: w as PptxGenJS.Coord, h: h as PptxGenJS.Coord };
        console.log(`---- Calculated Coords (Inches/%): x=${x}, y=${y}, w=${w}, h=${h}`); // Log calculated coords

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

                console.log(`---- Adding Text: Content='${textLayer.content}', Options=`, textOptions);
                slide.addText(textLayer.content || '', textOptions);
                break;
            }
            case 'media': {
                const mediaLayer = layer as MediaLayer;
                if (mediaLayer.url) {
                    const mediaOptions: PptxGenJS.ImageProps | PptxGenJS.MediaProps = {
                        ...baseOptions,
                        // path: mediaLayer.url, // We'll handle path/data below
                    };
                    if (mediaLayer.mediaType === 'image') {
                        // objectFit is harder to map directly, sizing='contain' or 'cover' might be closest
                        if (mediaLayer.objectFit) {
                            (mediaOptions as PptxGenJS.ImageProps).sizing = { type: mediaLayer.objectFit as 'contain' | 'cover', w: w as number, h: h as number };
                        }
                        // Check if it's an external URL
                        if (mediaLayer.url.startsWith('http://') || mediaLayer.url.startsWith('https://')) {
                            const base64Data = await imageUrlToBase64(mediaLayer.url);
                            if (base64Data) {
                                mediaOptions.data = base64Data; // Use data property for base64
                                console.log(`---- Adding Image (Base64): Options=`, { ...mediaOptions, data: '...' }); // Log options, truncate data
                                slide.addImage(mediaOptions as PptxGenJS.ImageProps);
                            } else {
                                console.warn(`Could not load image (CORS?): ${mediaLayer.url}. Skipping.`);
                                // Optionally add a placeholder text/shape
                                const errorTextOptions = { ...baseOptions, fontSize: 8, color: 'FF0000' };
                                console.log(`---- Adding Image Error Text: Options=`, errorTextOptions);
                                slide.addText(`[Image not loaded: ${mediaLayer.url}]`, errorTextOptions);
                            }
                        } else {
                            // Assume it's a local path or already a data URL
                            mediaOptions.path = mediaLayer.url;
                            console.log(`---- Adding Image (Path): Path='${mediaOptions.path}', Options=`, mediaOptions);
                            slide.addImage(mediaOptions as PptxGenJS.ImageProps);
                        }
                    } else if (mediaLayer.mediaType === 'video') {
                        // Similar logic could be applied for videos if needed,
                        // but pptxgenjs usually links videos rather than embedding full data.
                        (mediaOptions as PptxGenJS.MediaProps).type = 'video';
                        mediaOptions.path = mediaLayer.url; // Use path for video links
                        console.log(`---- Adding Media (Video): Path='${mediaOptions.path}', Options=`, mediaOptions);
                        slide.addMedia(mediaOptions as PptxGenJS.MediaProps);
                    }
                }
                break;
            }
            case 'table': {
                // const tableLayer = layer as TableLayer;
                // Basic placeholder, full table generation would be complex
                // Use correct enums from the pptx instance for alignment
                const placeholderOptions = { ...baseOptions, align: pptx.AlignH.center, valign: pptx.AlignV.middle, fontSize: 10, color: '666666' };
                console.log(`---- Adding Table Placeholder: Options=`, placeholderOptions);
                slide.addText('[Table Placeholder]', placeholderOptions);
                break;
            }
            case 'chart': {
                // const chartLayer = layer as ChartLayer;
                // Basic placeholder
                // Use correct enums from the pptx instance for alignment
                const placeholderOptionsChart = { ...baseOptions, align: pptx.AlignH.center, valign: pptx.AlignV.middle, fontSize: 10, color: '666666' };
                console.log(`---- Adding Chart Placeholder: Options=`, placeholderOptionsChart);
                slide.addText('[Chart Placeholder]', placeholderOptionsChart);
                break;
            }
            default:
                console.warn(`Unsupported layer type for export: ${(layer as any).type}`); // Cast to any for warning
                break;
        }
    } // End of layer loop (for...of)
  })); // End of Promise.all and map

  pptx.writeFile({ fileName: "MyPresentation.pptx" })
    .then(() => console.log("Presentation exported successfully."))
    .catch(err => console.error("Error exporting presentation:", err));
};