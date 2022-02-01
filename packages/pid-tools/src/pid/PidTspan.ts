import { BoundingBox, DiagramLabelOutputFormat } from '../types';
import { translatePointWithDom } from '../matcher/svgPathParser';
import { Point } from '../geometry';

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

    const bBoxTopLeft = translatePointWithDom(bBox.x, bBox.y, {
      svg,
      currentElem: tSpan,
    });

    const bBoxBottomRight = translatePointWithDom(
      bBox.x + bBox.width,
      bBox.y + bBox.height,
      {
        svg,
        currentElem: tSpan,
      }
    );

    const x = Math.min(bBoxTopLeft.x, bBoxBottomRight.x);
    const y = Math.min(bBoxTopLeft.y, bBoxBottomRight.y);
    const width = Math.abs(bBoxTopLeft.x - bBoxBottomRight.x);
    const height = Math.abs(bBoxTopLeft.y - bBoxBottomRight.y);

    const boundingBox = {
      x,
      y,
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
