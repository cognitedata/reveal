/* eslint-disable no-continue */
import { PidPath } from '../pid/PidPath';
import { PathSegment } from '../geometry/PathSegment';

import { svgCommandToSegments } from './svgPathParser';

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

export class InstanceMatcher {
  segmentList: PathSegment[];
  maxMidPointDistance: number;
  constructor(segmentList: PathSegment[]) {
    this.segmentList = segmentList;
    this.maxMidPointDistance = getMaxMidPointDistance(segmentList);
  }

  static fromPathCommand(pathCommand: string) {
    return new InstanceMatcher(svgCommandToSegments(pathCommand));
  }

  matches(other: PidPath[]): MatchResult {
    const otherPathSegments: PathSegment[] = [];
    other.forEach((svgPath) => {
      otherPathSegments.push(...svgPath.segmentList);
    });

    if (this.segmentList.length < otherPathSegments.length) {
      return MatchResult.NotMatch;
    }

    const potMatchIndex = getMaxLengthIndex(otherPathSegments);
    const potMatchReference = otherPathSegments[potMatchIndex];
    for (let i = 0; i < this.segmentList.length; i++) {
      if (!potMatchReference.isSimilar(this.segmentList[i])) continue;

      const matchResult = getMatchResultWithReferences(
        this.segmentList,
        i,
        otherPathSegments,
        potMatchIndex
      );

      if (matchResult !== MatchResult.NotMatch) {
        return matchResult;
      }
    }
    return MatchResult.NotMatch;
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
