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
  angleDifference,
  approxeq,
} from '../geometry';
import { PathReplacement, SvgPath, SvgPathWithId } from '../types';
import { T_JUNCTION, T_JUNCTION_SIZE } from '../constants';
import { splitBy, parseStyleString } from '../utils';

import { calculatePidPathsBoundingBox } from './utils';

export type PidPathStyle = Record<string, string>;

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

  getBoundingBox() {
    return calculatePidPathsBoundingBox([this]);
  }

  serializeToPathCommands(toFixed: null | number = null): string {
    return segmentsToSvgCommands(this.segmentList, toFixed);
  }

  translateAndScale(
    translatePoint: Point,
    scale: number | Point,
    scaleOrigin: Point | undefined
  ): PidPath {
    return new PidPath(
      this.segmentList.map((pathSegment) =>
        pathSegment.translateAndScale(translatePoint, scale, scaleOrigin)
      ),
      this.pathId,
      this.style
    );
  }

  rotate(degAngle: number, pivotPoint: Point | undefined): PidPath {
    return new PidPath(
      this.segmentList.map((pathSegment) =>
        pathSegment.rotate(degAngle, pivotPoint)
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

  getStyleString(): string | undefined {
    const { style } = this;
    if (style === undefined) return undefined;

    const outputStringList: string[] = [];
    Object.keys(style).forEach((key) => {
      outputStringList.push(`${key}:${style[key]}`);
    });
    return outputStringList.join(';');
  }

  static fromPathCommand(pathCommand: string, pathId = '') {
    return new PidPath(svgCommandsToSegments(pathCommand), pathId, undefined);
  }

  static fromSvgPath(svgPath: SvgPath) {
    const style =
      svgPath.style === undefined ? undefined : parseStyleString(svgPath.style);
    return new PidPath(svgCommandsToSegments(svgPath.svgCommands), '', style);
  }

  getTJunctionByIntersectionWith(
    splitGuide: PidPath
  ): PathReplacement[] | null {
    // `this` is the top of the 'T' while `spliteGuide` is the base (doens't need to have that orientation)
    const closestPoints = getClosestPointsOnSegments(
      this.segmentList,
      splitGuide.segmentList
    );

    if (closestPoints === undefined) return null;

    const outputPathReplacements: PathReplacement[] = [];

    const {
      index1: thisIndex,
      point1: intersection,
      percentAlongPath1,
      index2: splitGuideIndex,
    } = closestPoints;

    const distanceToClosestEndPoint =
      percentAlongPath1 <= 0.5
        ? intersection.distance(this.segmentList[thisIndex].start)
        : intersection.distance(this.segmentList[thisIndex].stop);

    // T junction would be too close to one of the endpoints of `this`
    if (distanceToClosestEndPoint <= T_JUNCTION_SIZE) return null;

    // The split guide must be closest to one of the ends
    if (
      splitGuideIndex !== 0 &&
      splitGuideIndex !== splitGuide.segmentList.length - 1
    )
      return null;

    const splitGuideSegment = splitGuide.segmentList[splitGuideIndex];

    // extend or shorten the split guide so it touches the T junction point
    let bottomOfTPoint: Point;
    let newSplitGuideSegments: PathSegment[] | undefined;
    if (
      splitGuideSegment.start.distance(intersection) <
      splitGuideSegment.stop.distance(intersection)
    ) {
      bottomOfTPoint = getPointTowardOtherPoint(
        intersection,
        splitGuideSegment.stop,
        T_JUNCTION_SIZE
      );
      newSplitGuideSegments = [
        new LineSegment(bottomOfTPoint, splitGuideSegment.stop),
        ...splitGuide.segmentList.slice(splitGuideIndex + 1),
      ];
    } else {
      bottomOfTPoint = getPointTowardOtherPoint(
        intersection,
        splitGuideSegment.start,
        T_JUNCTION_SIZE
      );
      newSplitGuideSegments = [
        ...splitGuide.segmentList.slice(0, splitGuideIndex),
        new LineSegment(splitGuideSegment.start, bottomOfTPoint),
      ];
    }

    outputPathReplacements.push({
      pathId: splitGuide.pathId,
      replacementPaths: [
        {
          svgCommands: segmentsToSvgCommands(newSplitGuideSegments),
          id: `${splitGuide.pathId}_1`,
        },
      ],
    });

    // calculate the two new paths that the top of the 'T' consisted of, and top left and top right point of the 'T'
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
          new LineSegment(intersection, bottomOfTPoint),
        ]),
        id: `${this.pathId}_${T_JUNCTION}`,
      },
    ];

    outputPathReplacements.push({
      pathId: this.pathId,
      replacementPaths: lineSegmentReplacementCommands,
    });

    return outputPathReplacements;
  }

  isFilled(): boolean {
    const { style } = this;
    if (style === undefined || style.fill === undefined) return false;
    return style.fill !== 'none';
  }

  getPathReplacementByAngles(
    angles: number[],
    threshold = 2,
    skipIfCloses = true
  ): PathReplacement | null {
    if (this.segmentList.length <= 1) return null;

    if (this.segmentList.some((segment) => segment instanceof CurveSegment))
      return null;

    // Hack to not split badly formatted paths in isometrics
    if (this.isFilled()) return null;

    if (
      skipIfCloses &&
      this.segmentList[0].start.distance(
        this.segmentList[this.segmentList.length - 1].stop
      ) < 1
    )
      return null;

    const isInAnglesToSplit = (
      pathSegment1: PathSegment,
      pathSegment2: PathSegment
    ) =>
      angles.some((angle) =>
        approxeq(
          Math.abs(
            angleDifference(
              pathSegment1.angle,
              pathSegment2.angle,
              'uniDirected'
            )
          ),
          angle,
          threshold
        )
      );

    const segmentsChunkedBySplitAngles = splitBy(
      this.segmentList,
      (segment, index, segmentList) =>
        isInAnglesToSplit(segmentList[index - 1], segment)
    );

    if (segmentsChunkedBySplitAngles.length <= 1) return null;

    return {
      pathId: this.pathId,
      replacementPaths: segmentsChunkedBySplitAngles.map(
        (pathSegments, index) => {
          return {
            id: `${this.pathId}_${index}`,
            svgCommands: segmentsToSvgCommands(pathSegments),
          };
        }
      ),
    };
  }
}
