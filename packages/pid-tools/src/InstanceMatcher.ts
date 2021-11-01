import { PathSegment, Point } from './PathSegments';

const normalizePaths = (
  paths: PathSegment[],
  normalizationPoint: Point | null
) => {
  // just selecting the first one, creates some instances where the matching will fail.
  // if obj1, path[0] is path[1] in object two, this will fail.
  // this means that the symmetry obj1.matches(obj2) == obj2.matches(obj1) does not currently hold true.
  const { x, y } = normalizationPoint || paths[0].start;
  const scaleValue =
    Math.abs(paths[0].start.x - paths[0].stop.x) +
    Math.abs(paths[0].start.y - paths[0].stop.y);
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    path.start = new Point(
      (path.start.x - x) / scaleValue,
      (path.start.y - y) / scaleValue
    );
    path.stop = new Point(
      (path.stop.x - x) / scaleValue,
      (path.stop.y - y) / scaleValue
    );
  }

  return { normalizedSegmentList: paths, normalPoint: new Point(x, y) };
};

export class InstanceMatcher {
  segmentList: PathSegment[];
  normalizationPoint: Point | null;
  constructor(
    segmentList: PathSegment[],
    normalizationPoint: Point | null = null
  ) {
    const { normalizedSegmentList, normalPoint } = normalizePaths(
      segmentList,
      normalizationPoint
    );
    this.segmentList = normalizedSegmentList;
    this.normalizationPoint = normalizationPoint || normalPoint;
  }
  matches(instance: InstanceMatcher) {
    let matchedLines = 0;
    for (let i = 0; i < instance.segmentList.length; i++) {
      for (let j = 0; j < this.segmentList.length; j++) {
        const instancePath = instance.segmentList[i];
        const myPath = this.segmentList[j];
        if (instancePath.isSimilar(myPath)) {
          matchedLines += 1;
          break;
        }
      }
    }
    return matchedLines;
  }
}
