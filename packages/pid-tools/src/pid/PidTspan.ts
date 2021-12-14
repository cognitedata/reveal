import { BoundingBox } from '../types';

export class PidTspan {
  id: string;
  boundingBox: BoundingBox;
  text: string;

  constructor(id: string, text: string, boundingBox: BoundingBox) {
    this.id = id;
    this.boundingBox = boundingBox;
    this.text = text;
  }

  static fromSVGTSpan(tSpan: SVGTSpanElement) {
    const bBox = (tSpan.parentElement as unknown as SVGTextElement).getBBox();
    const boundingBox = {
      x: bBox.x,
      y: bBox.y,
      width: bBox.width,
      height: bBox.height,
    };
    return new PidTspan(tSpan.id, tSpan.innerHTML, boundingBox);
  }
}
