/* eslint-disable no-continue */
import {
  segmentsToSvgCommands,
  svgCommandsToSegments,
  svgCommandsToSegmentsWithDom,
} from '../matcher/svgPathParser';
import {
  PathSegment,
  Point,
  calculateMidPointFromPathSegments,
  LineSegment,
  getPointTowardOtherPoint,
  getClosestPointsOnSegments,
  CurveSegment,
} from '../geometry';
import { PathReplacement, SvgPathWithId } from '../types';
import { T_JUNCTION, T_JUNCTION_SIZE } from '../constants';

interface PidPathStyle {
  strokeLinejoin: string;
  stroke: string;
  fill: string;
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
    const { strokeLinejoin, stroke, fill } = svgElement.style;
    return new PidPath(
      svgCommandsToSegmentsWithDom(
        svgElement.getAttribute('d') as string,
        mainSVG,
        svgElement.id
      ),
      svgElement.id,
      { strokeLinejoin, stroke, fill }
    );
  }

  static fromPathCommand(pathCommand: string, pathId = '') {
    return new PidPath(svgCommandsToSegments(pathCommand), pathId, undefined);
  }

  getTJunctionByIntersectionWith(
    splitGuide: PidPath
  ): [PathReplacement, PathReplacement] | null {
    // `this` is the top of the 'T' while `spliteGuide` is the base (doens't need to have that orientation)
    const closestPoints = getClosestPointsOnSegments(
      this.segmentList,
      splitGuide.segmentList
    );

    if (closestPoints === undefined) return null;

    const {
      index1: thisIndex,
      point1: intersection,
      percentAlongPath1,
      index2: splitGuideIndex,
      percentAlongPath2,
      distance,
    } = closestPoints;

    if (
      !(
        percentAlongPath1 > 0.1 &&
        percentAlongPath1 < 0.9 &&
        (percentAlongPath2 < 0.1 || percentAlongPath2 > 0.9)
      )
    )
      return null;

    // we do not want to create a 'T' junction if the the distance between the base and top is too big
    if (distance > T_JUNCTION_SIZE / 2) return null;

    // calculate the new shorten path for the base and the point at where the buttom of the T should start
    let splitGuideTPoint: Point;
    let splitGuideSvgPathWithId: SvgPathWithId;
    const splitGuideSegment = splitGuide.segmentList[splitGuideIndex];
    const splitGuideNewId = `${splitGuide.pathId}_1`;
    if (
      splitGuideIndex === 0 &&
      splitGuideSegment.start.distance(intersection) <
        splitGuideSegment.stop.distance(intersection)
    ) {
      splitGuideTPoint = getPointTowardOtherPoint(
        splitGuideSegment.start,
        splitGuideSegment.stop,
        T_JUNCTION_SIZE
      );
      splitGuideSvgPathWithId = {
        svgCommands: segmentsToSvgCommands([
          new LineSegment(splitGuideTPoint, splitGuideSegment.stop),
          ...splitGuide.segmentList.slice(splitGuideIndex + 1),
        ]),
        id: splitGuideNewId,
      };
    } else {
      splitGuideTPoint = getPointTowardOtherPoint(
        splitGuideSegment.stop,
        splitGuideSegment.start,
        T_JUNCTION_SIZE
      );
      splitGuideSvgPathWithId = {
        svgCommands: segmentsToSvgCommands([
          ...splitGuide.segmentList.slice(0, splitGuideIndex),
          new LineSegment(splitGuideSegment.start, splitGuideTPoint),
        ]),
        id: splitGuideNewId,
      };
    }

    // calculate the two new paths that the top of the 'T' consisted of and top left and top right point of the 'T'
    const { start, stop } = this.segmentList[thisIndex];
    const line1StopPoint = getPointTowardOtherPoint(
      intersection,
      start,
      T_JUNCTION_SIZE
    );
    const line2StartPoint = getPointTowardOtherPoint(
      intersection,
      stop,
      T_JUNCTION_SIZE
    );
    const lineSegmentReplacementCommands: SvgPathWithId[] = [
      {
        svgCommands: segmentsToSvgCommands([
          ...this.segmentList.slice(0, thisIndex),
          new LineSegment(start, line1StopPoint),
        ]),
        id: `${this.pathId}_1`,
      },
      {
        svgCommands: segmentsToSvgCommands([
          new LineSegment(line2StartPoint, stop),
          ...this.segmentList.slice(thisIndex + 1),
        ]),
        id: `${this.pathId}_2`,
      },
      {
        svgCommands: segmentsToSvgCommands([
          new LineSegment(line1StopPoint, line2StartPoint),
          new LineSegment(intersection, splitGuideTPoint),
        ]),
        id: `${this.pathId}_${T_JUNCTION}`,
      },
    ];

    return [
      {
        pathId: this.pathId,
        replacementPaths: lineSegmentReplacementCommands,
      },
      {
        pathId: splitGuide.pathId,
        replacementPaths: [splitGuideSvgPathWithId],
      },
    ];
  }

  getPathReplacementIfManySegments(): PathReplacement | null {
    if (
      this.segmentList.length > 1 &&
      !this.segmentList.some((segment) => segment instanceof CurveSegment) &&
      this.style?.fill === 'none'
    ) {
      return {
        pathId: this.pathId,
        replacementPaths: this.segmentList.map((pathSegment, index) => {
          return {
            id: `${this.pathId}_${index}`,
            svgCommands: segmentsToSvgCommands([pathSegment]),
          };
        }),
      };
    }
    return null;
  }
}
