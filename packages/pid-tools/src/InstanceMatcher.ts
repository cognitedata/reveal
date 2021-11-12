import { approxeqrel, PathSegment, Point } from './PathSegments';

export enum MatchResult {
  Match,
  SubMatch,
  NotMatch,
}

const errorMargin = 0.2;

export class InstanceMatcher {
  segmentList: PathSegment[];
  constructor(segmentList: PathSegment[]) {
    this.segmentList = segmentList;
  }

  normalizedMidPoints(): Point[] {
    const minMidPointList = this.segmentList
      .map((sL) => sL.midPoint)
      .sort((a, b) => a.lessThan(b));

    const minMidPoint = minMidPointList[0];
    return minMidPointList.map((mp) => mp.minus(minMidPoint));
  }

  private midPointDistances(): number[] {
    const localMidPointDistances: number[] = [];
    for (let i = 0; i < this.segmentList.length - 1; ++i) {
      const midPointI = this.segmentList[i].midPoint;
      for (let j = i + 1; j < this.segmentList.length; ++j) {
        const midPointJ = this.segmentList[j].midPoint;
        localMidPointDistances.push(midPointI.distance(midPointJ));
      }
    }
    return localMidPointDistances.sort((a, b) => a - b);
  }

  isTooSpreadOut(other: InstanceMatcher): boolean {
    const myMidDistances = this.midPointDistances();
    const otherMidDistances = other.midPointDistances();

    if (myMidDistances.length === otherMidDistances.length) {
      for (let i = 0; i < myMidDistances.length; ++i) {
        if (
          !approxeqrel(myMidDistances[i], otherMidDistances[i], errorMargin)
        ) {
          return true;
        }
      }
      return false;
    }

    const myMaxDistance = myMidDistances[myMidDistances.length - 1];
    const otherMaxDistance = otherMidDistances[otherMidDistances.length - 1];
    return (1 + errorMargin) * myMaxDistance < otherMaxDistance;
  }

  matches(other: InstanceMatcher): MatchResult {
    if (
      other.segmentList.length > this.segmentList.length ||
      this.isTooSpreadOut(other)
    ) {
      return MatchResult.NotMatch;
    }

    // this does not take orientation of the pathSegments into account
    const matchedSegments = new Set<number>();

    for (let i = 0; i < other.segmentList.length; i++) {
      const otherPath = other.segmentList[i];
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
