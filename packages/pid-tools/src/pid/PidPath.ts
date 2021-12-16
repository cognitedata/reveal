import {
  segmentsToSVGCommand,
  svgCommandToSegments,
} from '../matcher/svgPathParser';
import {
  PathSegment,
  Point,
  calculateMidPointFromPathSegments,
} from '../geometry';

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
      this.midPoint = calculateMidPointFromPathSegments(this.segmentList);
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
