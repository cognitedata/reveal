import { getEncolosingBoundingBox, Point } from '../geometry';
import { Rect, SvgPath, SvgRepresentation } from '../types';
import { PidPath } from '../pid';

export const calculatePidPathsBoundingBox = (pidPaths: PidPath[]): Rect => {
  const boundingBoxes = pidPaths.flatMap((pidPath) =>
    pidPath.segmentList.map((pathSegment) => pathSegment.boundingBox)
  );

  return getEncolosingBoundingBox(boundingBoxes);
};

export const createSvgRepresentation = (
  pidPaths: PidPath[],
  normalizeToBoundingBox: boolean,
  toFixed: number | null = null
): SvgRepresentation => {
  const boundingBox = calculatePidPathsBoundingBox(pidPaths);
  let svgPaths: SvgPath[];
  if (normalizeToBoundingBox) {
    const translatePoint = new Point(boundingBox.x, boundingBox.y);
    const scaleX = boundingBox.width === 0 ? 0 : 1 / boundingBox.width;
    const scaleY = boundingBox.height === 0 ? 0 : 1 / boundingBox.height;
    const scale = new Point(scaleX, scaleY);
    svgPaths = pidPaths
      .sort((a, b) => a.segmentList[0].start.lessThan(b.segmentList[0].start))
      .map((pidPath) => {
        const svgCommands = pidPath
          .translateAndScale(translatePoint, scale)
          .serializeToPathCommands(toFixed);
        return { svgCommands };
      });
  } else {
    svgPaths = pidPaths
      .sort((a, b) => a.segmentList[0].start.lessThan(b.segmentList[0].start))
      .map((pidPath) => {
        const svgCommands = pidPath.serializeToPathCommands(toFixed);
        return { svgCommands };
      });
  }
  return { boundingBox, svgPaths };
};
