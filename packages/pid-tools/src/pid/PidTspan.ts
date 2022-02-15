import { BoundingBox, DiagramLabelOutputFormat } from '../types';
import { translatePointWithDom } from '../matcher/svgPathParser';
import { Point } from '../geometry';

// The text exported to PDF can vary slightly then the one in SVG.
// This scaling should make sure that the bounding box never will be too short.
const textWidthScale = 1.2;

export class PidTspan {
  id: string;
  boundingBox: BoundingBox;
  text: string;

  constructor(id: string, text: string, boundingBox: BoundingBox) {
    this.id = id;
    this.boundingBox = boundingBox;
    this.text = text;
  }

  static fromSVGTSpan(tSpan: SVGTSpanElement, svg: SVGSVGElement) {
    const bBox = (tSpan.parentElement as unknown as SVGTextElement).getBBox();

    const textWidth = textWidthScale * bBox.width;

    const topLeftUnrotated = translatePointWithDom(bBox.x, bBox.y, {
      svg,
      currentElem: tSpan,
    });

    const topRightUnrotated = translatePointWithDom(
      bBox.x + textWidth,
      bBox.y,
      {
        svg,
        currentElem: tSpan,
      }
    );

    const bottomLeftUnrotated = translatePointWithDom(
      bBox.x,
      bBox.y + bBox.height,
      {
        svg,
        currentElem: tSpan,
      }
    );

    const bottomRightUnrotated = translatePointWithDom(
      bBox.x + textWidth,
      bBox.y + bBox.height,
      {
        svg,
        currentElem: tSpan,
      }
    );

    const xMin = Math.min(
      topLeftUnrotated.x,
      topRightUnrotated.x,
      bottomLeftUnrotated.x,
      bottomRightUnrotated.x
    );
    const xMax = Math.max(
      topLeftUnrotated.x,
      topRightUnrotated.x,
      bottomLeftUnrotated.x,
      bottomRightUnrotated.x
    );
    const yMin = Math.min(
      topLeftUnrotated.y,
      topRightUnrotated.y,
      bottomLeftUnrotated.y,
      bottomRightUnrotated.y
    );
    const yMax = Math.max(
      topLeftUnrotated.y,
      topRightUnrotated.y,
      bottomLeftUnrotated.y,
      bottomRightUnrotated.y
    );

    const width = xMax - xMin;
    const height = yMax - yMin;

    const boundingBox = {
      x: xMin,
      y: yMin,
      width,
      height,
    };
    return new PidTspan(tSpan.id, tSpan.innerHTML, boundingBox);
  }

  getMidPoint(): Point {
    return Point.midPointFromBoundingBox(this.boundingBox);
  }

  toDiagramLabelOutputFormat(): DiagramLabelOutputFormat {
    return {
      id: this.id,
      text: this.text,
      boundingBox: this.boundingBox,
    };
  }
}
