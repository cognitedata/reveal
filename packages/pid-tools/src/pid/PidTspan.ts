import { getSvgElementToSvgMatrix } from '../geometry/svgPathParser';
import { Rect, DiagramLabelOutputFormat } from '../types';
import { Point } from '../geometry';

// The rendered text in the PDF and SVG can vary slightly.
// This purpose of this scaling is to make sure that the text is not too small.
const textWidthScale = 1.2;

export class PidTspan {
  id: string;
  boundingBox: Rect;
  text: string;

  constructor(id: string, text: string, boundingBox: Rect) {
    this.id = id;
    this.boundingBox = boundingBox;
    this.text = text;
  }

  static fromSVGTSpan(tSpan: SVGTSpanElement, sceenCTMToSVGMatrix: DOMMatrix) {
    const bBox = (tSpan.parentElement as unknown as SVGTextElement).getBBox();
    const textWidth = textWidthScale * bBox.width;

    const svgElemeentToSvgMatrix = getSvgElementToSvgMatrix(
      tSpan,
      sceenCTMToSVGMatrix
    );

    const topLeftUnrotated = new DOMPoint(bBox.x, bBox.y).matrixTransform(
      svgElemeentToSvgMatrix
    );

    const topRightUnrotated = new DOMPoint(
      bBox.x + textWidth,
      bBox.y
    ).matrixTransform(svgElemeentToSvgMatrix);

    const bottomLeftUnrotated = new DOMPoint(
      bBox.x,
      bBox.y + bBox.height
    ).matrixTransform(svgElemeentToSvgMatrix);

    const bottomRightUnrotated = new DOMPoint(
      bBox.x + textWidth,
      bBox.y + bBox.height
    ).matrixTransform(svgElemeentToSvgMatrix);

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
