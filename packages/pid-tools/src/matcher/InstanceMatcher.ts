import { approxeqrel, PathSegment, Point } from './PathSegments';
import { segmentsToSVGCommand, svgCommandToSegments } from './svgPathParser';

export enum MatchResult {
  Match,
  SubMatch,
  NotMatch,
}

const errorMargin = 0.2;

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

const midPointDistances = (pathSgements: PathSegment[]) => {
  const localMidPointDistances: number[] = [];
  for (let i = 0; i < pathSgements.length - 1; ++i) {
    const midPointI = pathSgements[i].midPoint;
    for (let j = i + 1; j < pathSgements.length; ++j) {
      const midPointJ = pathSgements[j].midPoint;
      localMidPointDistances.push(midPointI.distance(midPointJ));
    }
  }
  return localMidPointDistances.sort((a, b) => a - b);
};

export class InternalSvgPath {
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
  serializeToPathCommands(): string {
    return segmentsToSVGCommand(this.segmentList);
  }
}

export class InstanceMatcher {
  segmentList: PathSegment[];
  midPointDistances: number[];
  maxMidPointDistance: number;
  constructor(segmentList: PathSegment[]) {
    this.segmentList = segmentList;
    this.midPointDistances = midPointDistances(segmentList);
    this.maxMidPointDistance =
      this.midPointDistances[this.midPointDistances.length - 1];
  }

  isTooSpreadOut(pathSegments: PathSegment[]): boolean {
    const otherMidDistances = midPointDistances(pathSegments);

    if (this.midPointDistances.length === otherMidDistances.length) {
      for (let i = 0; i < this.midPointDistances.length; ++i) {
        if (
          !approxeqrel(
            this.midPointDistances[i],
            otherMidDistances[i],
            errorMargin
          )
        ) {
          return true;
        }
      }
      return false;
    }

    const otherMaxDistance = otherMidDistances[otherMidDistances.length - 1];
    return (1 + errorMargin) * this.maxMidPointDistance < otherMaxDistance;
  }

  matches(other: InternalSvgPath[]): MatchResult {
    const combinedPathSegments: PathSegment[] = [];
    other.forEach((svgPath) => {
      svgPath.segmentList.forEach((pathSegment) => {
        combinedPathSegments.push(pathSegment);
      });
    });

    if (
      combinedPathSegments.length > this.segmentList.length ||
      this.isTooSpreadOut(combinedPathSegments)
    ) {
      return MatchResult.NotMatch;
    }

    // this does not take orientation of the pathSegments into account
    const matchedSegments = new Set<number>();

    for (let i = 0; i < combinedPathSegments.length; i++) {
      const otherPath = combinedPathSegments[i];
      let foundMatch = false;
      for (let j = 0; j < this.segmentList.length; j++) {
        if (matchedSegments.has(j)) {
          continue; // eslint-disable-line no-continue
        }
        const myPath = this.segmentList[j];
        if (myPath.isSimilar(otherPath)) {
          matchedSegments.add(j);
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        return MatchResult.NotMatch;
      }
    }

    const numMathces = matchedSegments.size;
    if (numMathces === this.segmentList.length) {
      return MatchResult.Match;
    }

    if (numMathces > 0) {
      return MatchResult.SubMatch;
    }
    return MatchResult.NotMatch;
  }
}

export const newMatcher = (path: string) => {
  return new InstanceMatcher(svgCommandToSegments(path));
};

export const newInternalSvgPath = (path: string, pathId = '') => {
  return new InternalSvgPath(svgCommandToSegments(path, pathId), pathId);
};
