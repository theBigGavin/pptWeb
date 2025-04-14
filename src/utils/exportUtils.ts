import PptxGenJS from "pptxgenjs";
import { SlideNode } from '../types'; // Removed unused SlideLayout import
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

  orderedNodes.forEach((node) => {
    const slide = pptx.addSlide();
    const { data } = node;
    const title = data?.label || "无标题";
    const content1 = data?.content1 || "";
    const content2 = data?.content2 || "";
    const content3 = data?.content3 || "";
    const content4 = data?.content4 || "";
    const layout = data?.layout || "title_content";

    // Common title options
    const titleOptions: PptxGenJS.TextPropsOptions = {
      x: 0.5, y: 0.25, w: '90%', h: 0.75,
      fontSize: 24, bold: true, align: 'center',
    };
    // Common content options (base)
    const contentOptions: PptxGenJS.TextPropsOptions = {
      fontSize: 14, align: 'left',
    };

    // Add title (always present unless blank?)
    if (layout !== 'blank') {
      slide.addText(title, titleOptions);
    }

    // Add content based on layout
    switch (layout) {
      case 'title_content':
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: '90%', h: '75%' });
        break;
      case 'title_two_content_vertical':
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: '90%', h: '40%' });
        if (content2) slide.addText(content2, { ...contentOptions, x: 0.5, y: 3.5, w: '90%', h: '40%' });
        break;
      case 'title_two_content_horizontal':
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: '44%', h: '75%' });
        if (content2) slide.addText(content2, { ...contentOptions, x: 5.1, y: 1.2, w: '44%', h: '75%' });
        break;
      case 'title_four_content_grid':
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: '44%', h: '35%' });
        if (content2) slide.addText(content2, { ...contentOptions, x: 5.1, y: 1.2, w: '44%', h: '35%' });
        if (content3) slide.addText(content3, { ...contentOptions, x: 0.5, y: 3.0, w: '44%', h: '35%' });
        if (content4) slide.addText(content4, { ...contentOptions, x: 5.1, y: 3.0, w: '44%', h: '35%' });
        break;
      case 'title_four_content_horizontal': {
        const colW = '22%'; // Approx width for 4 columns with small gaps
        const colGap = 0.2;
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: colW, h: '75%' });
        if (content2) slide.addText(content2, { ...contentOptions, x: 0.5 + (1 * parseFloat(colW)) + (1 * colGap), y: 1.2, w: colW, h: '75%' });
        if (content3) slide.addText(content3, { ...contentOptions, x: 0.5 + (2 * parseFloat(colW)) + (2 * colGap), y: 1.2, w: colW, h: '75%' });
        if (content4) slide.addText(content4, { ...contentOptions, x: 0.5 + (3 * parseFloat(colW)) + (3 * colGap), y: 1.2, w: colW, h: '75%' });
        break;
      }
      case 'title_only':
      case 'blank':
        // No content to add
        break;
      default:
        if (content1) slide.addText(content1, { ...contentOptions, x: 0.5, y: 1.2, w: '90%', h: '75%' });
        break;
    }
  });

  pptx.writeFile({ fileName: "MyPresentation.pptx" })
    .then(() => console.log("Presentation exported successfully."))
    .catch(err => console.error("Error exporting presentation:", err));
};