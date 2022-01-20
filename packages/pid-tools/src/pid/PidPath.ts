import {
  segmentsToSvgCommands,
  svgCommandsToSegments,
  svgCommandsToSegmentsWithDom,
} from '../matcher/svgPathParser';
import {
  PathSegment,
  Point,
  calculateMidPointFromPathSegments,
} from '../geometry';

interface PidPathStyle {
  strokeLinejoin: string;
  stroke: string;
}

export class PidPath {
  segmentList: PathSegment[];
  midPoint: Point;
  pathId: string;
  style?: PidPathStyle;

  constructor(
    segmentList: PathSegment[],
    pathId: string,
    style: PidPathStyle | undefined = undefined,
    midPoint: undefined | Point = undefined
  ) {
    this.segmentList = segmentList;
    this.style = style;
    this.pathId = pathId;
    if (midPoint !== undefined) {
      this.midPoint = midPoint;
    } else {
      this.midPoint = calculateMidPointFromPathSegments(this.segmentList);
    }
  }

  serializeToPathCommands(toFixed: null | number = null): string {
    return segmentsToSvgCommands(this.segmentList, toFixed);
  }

  translateAndScale(translatePoint: Point, scale: number | Point): PidPath {
    return new PidPath(
      this.segmentList.map((pathSegment) =>
        pathSegment.translateAndScale(translatePoint, scale)
      ),
      this.pathId,
      this.style
    );
  }

  static fromSVGElement(svgElement: SVGPathElement, mainSVG: SVGSVGElement) {
    const { strokeLinejoin, stroke } = svgElement.style;
    return new PidPath(
      svgCommandsToSegmentsWithDom(
        svgElement.getAttribute('d') as string,
        mainSVG,
        svgElement.id
      ),
      svgElement.id,
      { strokeLinejoin, stroke }
    );
  }

  static fromPathCommand(pathCommand: string, pathId = '') {
    return new PidPath(svgCommandsToSegments(pathCommand), pathId, undefined);
  }
}
