import {
  segmentsToSVGCommand,
  svgCommandToSegments,
} from '../matcher/svgPathParser';
import { PathSegment, Point } from '../matcher/PathSegments';

const calculateMidPoint = (pathSegments: PathSegment[]) => {
  let sumX = 0;
  let sumY = 0;
  pathSegments.forEach((pathSegment) => {
    const { midPoint } = pathSegment;
    sumX += midPoint.x;
    sumY += midPoint.y;
  });

  const numSegment = pathSegments.length;
  return new Point(sumX / numSegment, sumY / numSegment);
};

export class PidPath {
  segmentList: PathSegment[];
  midPoint: Point;
  pathId: string;
  constructor(
    segmentList: PathSegment[],
    pathId: string,
    midPoint: undefined | Point = undefined
  ) {
    this.segmentList = segmentList;

    this.pathId = pathId;
    if (midPoint !== undefined) {
      this.midPoint = midPoint;
    } else {
      this.midPoint = calculateMidPoint(this.segmentList);
    }
  }
  serializeToPathCommands(toFixed: null | number = null): string {
    return segmentsToSVGCommand(this.segmentList, toFixed);
  }

  static fromSVGElement(svgElement: SVGPathElement) {
    return PidPath.fromPathCommand(
      svgElement.getAttribute('d') as string,
      svgElement.id
    );
  }

  static fromPathCommand(pathCommand: string, pathId = '') {
    return new PidPath(svgCommandToSegments(pathCommand, pathId), pathId);
  }
}
