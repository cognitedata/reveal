import { BoundingBox, DiagramLabelOutputFormat } from '../types';
import { translatePointWithDom } from '../matcher/svgPathParser';
import { calculateMidPointFromBoundingBox, Point } from '../geometry';

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

    const bBoxXYMin = translatePointWithDom(bBox.x, bBox.y, {
      svg,
      currentElem: tSpan,
    });

    const bBoxXYMax = translatePointWithDom(
      bBox.x + bBox.width,
      bBox.y + bBox.height,
      {
        svg,
        currentElem: tSpan,
      }
    );

    const width = bBoxXYMax.x - bBoxXYMin.x;
    const height = bBoxXYMax.y - bBoxXYMin.y;
    const boundingBox = {
      x: bBoxXYMin.x,
      y: bBoxXYMin.y,
      width,
      height,
    };
    return new PidTspan(tSpan.id, tSpan.innerHTML, boundingBox);
  }

  getMidPoint(): Point {
    return calculateMidPointFromBoundingBox(this.boundingBox);
  }

  toDiagramLabelOutputFormat(): DiagramLabelOutputFormat {
    return {
      id: this.id,
      text: this.text,
      boundingBox: this.boundingBox,
    };
  }
}
