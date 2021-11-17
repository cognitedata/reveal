import { BoundingBox } from 'types';

export const getSvgBoundingBox = (svgElements: SVGElement[]): BoundingBox => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  svgElements.forEach((svgElement) => {
    const bBox = (
      document.querySelector(`#${svgElement.id}`) as unknown as SVGPathElement
    ).getBBox();
    minX = Math.min(minX, bBox.x);
    minY = Math.min(minY, bBox.y);
    maxX = Math.max(maxX, bBox.x + bBox.width);
    maxY = Math.max(maxY, bBox.y + bBox.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
