/* eslint-disable no-continue */
import { angleDifference, approxeq } from '../geometry';
import { PidPath } from '../pid/PidPath';
import { PathSegment } from '../geometry/PathSegment';

import { svgCommandsToSegments } from './svgPathParser';

const scaleThresholdLow = 0.5;
const scaleThresholdHigh = 1.5;

export enum MatchResult {
  Match,
  SubMatch,
  NotMatch,
}

const getMaxLengthIndex = (pathSegments: PathSegment[]): number => {
  let maxLength = 0;
  let maxLengthIndex = 0;
  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].length > maxLength) {
      maxLength = pathSegments[i].length;
      maxLengthIndex = i;
    }
  }
  return maxLengthIndex;
};

const getMidPointDistances = (pathSegments: PathSegment[]) => {
  const localMidPointDistances: number[] = [];
  for (let i = 0; i < pathSegments.length - 1; ++i) {
    const midPointI = pathSegments[i].midPoint;
    for (let j = i + 1; j < pathSegments.length; ++j) {
      const midPointJ = pathSegments[j].midPoint;
      localMidPointDistances.push(midPointI.distance(midPointJ));
    }
  }
  return localMidPointDistances.sort((a, b) => a - b);
};

const getMaxMidPointDistance = (pathSegments: PathSegment[]) => {
  const midPointDistances = getMidPointDistances(pathSegments);
  return midPointDistances[midPointDistances.length - 1];
};

const getScaleIfSimilar = (
  pathSegment1: PathSegment,
  pathSegment2: PathSegment
): number | undefined => {
  if (pathSegment1.pathType !== pathSegment2.pathType) return undefined;

  if (
    !approxeq(
      angleDifference(pathSegment1.angle, pathSegment2.angle, 'uniDirected'),
      0,
      10
    )
  )
    return undefined;

  return pathSegment1.length / pathSegment2.length;
};

const scaleIsWithinThreshold = (
  scaleIfSimilar: number | undefined
): boolean => {
  return (
    scaleIfSimilar !== undefined &&
    scaleIfSimilar > scaleThresholdLow &&
    scaleIfSimilar < scaleThresholdHigh
  );
};

export interface InstanceMatch {
  match: MatchResult;
  scale?: number;
}

export class InstanceMatcher {
  segmentList: PathSegment[];
  maxMidPointDistance: number;
  constructor(segmentList: PathSegment[]) {
    this.segmentList = segmentList;
    this.maxMidPointDistance = getMaxMidPointDistance(segmentList);
  }

  static fromPathCommand(pathCommand: string) {
    return new InstanceMatcher(svgCommandsToSegments(pathCommand));
  }

  matches(other: PidPath[]): InstanceMatch {
    const otherPathSegments: PathSegment[] = [];
    other.forEach((svgPath) => {
      otherPathSegments.push(...svgPath.segmentList);
    });

    if (this.segmentList.length < otherPathSegments.length) {
      return { match: MatchResult.NotMatch };
    }

    const potMatchIndex = getMaxLengthIndex(otherPathSegments);
    const potMatchReference = otherPathSegments[potMatchIndex];
    for (let i = 0; i < this.segmentList.length; i++) {
      const scaleIfSimilar = getScaleIfSimilar(
        potMatchReference,
        this.segmentList[i]
      );
      if (!scaleIsWithinThreshold(scaleIfSimilar)) continue;

      const matchResult = getMatchResultWithReferences(
        this.segmentList,
        i,
        otherPathSegments,
        potMatchIndex
      );

      if (matchResult !== MatchResult.NotMatch) {
        return { match: matchResult, scale: scaleIfSimilar };
      }
    }
    return { match: MatchResult.NotMatch };
  }
}

const distanceThreshold = 15;
export const getMatchResultWithReferences = (
  pathSegments: PathSegment[],
  pathRefIndex: number,
  potMatchSegments: PathSegment[],
  potRefIndex: number
) => {
  const pathRefOrigin = pathSegments[pathRefIndex].midPoint;
  const pathRefScale = 100 / pathSegments[pathRefIndex].length;
  const potRefOrigin = potMatchSegments[potRefIndex].midPoint;
  const potRefScale = 100 / potMatchSegments[potRefIndex].length;

  const matchedPathSegments = pathSegments.map(() => false);
  for (let i = 0; i < potMatchSegments.length; i++) {
    let minDistance = Infinity;
    let minDistanceIndex = -1;
    for (let j = 0; j < pathSegments.length; j++) {
      if (matchedPathSegments[j]) continue;
      const distance = potMatchSegments[i].getTranslationAndScaleDistance(
        potRefOrigin,
        potRefScale,
        pathSegments[j],
        pathRefOrigin,
        pathRefScale
      );
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = j;
      }
    }
    if (minDistance >= distanceThreshold) {
      return MatchResult.NotMatch;
    }
    matchedPathSegments[minDistanceIndex] = true;
  }

  // A match was found for all the potential match path segments
  if (potMatchSegments.length === pathSegments.length) {
    return MatchResult.Match;
  }
  return MatchResult.SubMatch;
};
