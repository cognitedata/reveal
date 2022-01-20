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
} from '../geometry';
import { PathReplacement, SvgPathWithId } from '../types';
import { T_JUNCTION } from '../constants';

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

  getTJunctionByIntersectionWith(
    splitGuide: PidPath
  ): [PathReplacement, PathReplacement] | null {
    // `this` is the top of the 'T' while `spliteGuide` is the base (doens't need to have that orientation)
    const closestPoints = getClosestPointsOnSegments(
      this.segmentList,
      splitGuide.segmentList
    );

    if (closestPoints === undefined) return null;

    const tLength = 2;

    const {
      index1: thisIndex,
      point1: intersection,
      index2: splitGuideIndex,
      distance,
    } = closestPoints;

    // we do not want to create a 'T' junction if the the distance between the base and top is too big
    if (distance > tLength / 2) return null;

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
        tLength
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
        tLength
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
      tLength
    );
    const line2StartPoint = getPointTowardOtherPoint(
      intersection,
      stop,
      tLength
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
}
