/* eslint-disable no-continue */
import maxBy from 'lodash/maxBy';

import { angleDifference, approxeq, mod, PathSegment } from '../geometry';
import { getDiagramInstanceIdFromPathIds, isFileConnection } from '../utils';
import {
  KdTreePidPath,
  PidDocument,
  PidGroup,
  PidPath,
  PidPathPoint,
} from '../pid';
import { DiagramSymbol, DiagramSymbolInstance } from '../types';
import { Point } from '../geometry/Point';

const MATCH_DISTANCE_THRESHOLD = 0.35;
const SCALE_THRESHOLD = 0.5; // will search for symbols in [1 - SCALE_THRESHOLD, 1 + SCALE_THRESHOLD] range (inclusive)
const PERCENTAGE_PATH_SEGMENTS_MATCHED_PER_PATH_ID = 0.8;
const PERCENTAGE_PATH_IDS_MATCHED = 0.5;

interface PathSegmentWithFill {
  pathSegment: PathSegment;
  isFilled: boolean;
}

const matchesSymbol = (
  kdTree: KdTreePidPath,
  pathSegmentWithFillList: PathSegmentWithFill[],
  translation: Point,
  rotation: number,
  scale: Point | number,
  scaleOrigin: Point
): Set<string> | null => {
  const matchedSegments = new Set<string>();

  for (let i = 0; i < pathSegmentWithFillList.length; i++) {
    const pathSegmentWithFill = pathSegmentWithFillList[i];
    const transformedPathSegment = pathSegmentWithFill.pathSegment
      .translateAndScale(translation, scale, scaleOrigin)
      .rotate(rotation, scaleOrigin);

    const transformedPidPathPoint: PidPathPoint = {
      x: transformedPathSegment.midPoint.x,
      y: transformedPathSegment.midPoint.y,
      pathSegment: transformedPathSegment,
      index: 0,
      pathId: 'a',
      isFilled: false,
    };

    const potPidPathPoints = kdTree.nearest(transformedPidPathPoint, 20, 3);

    let matchedSegment = false;
    for (let j = 0; j < potPidPathPoints.length; j++) {
      const potPidPathPoint = potPidPathPoints[j][0];

      if (potPidPathPoint.isFilled !== pathSegmentWithFill.isFilled) continue;

      const distance = transformedPathSegment.getDistance(
        potPidPathPoint.pathSegment
      );

      if (distance <= MATCH_DISTANCE_THRESHOLD) {
        matchedSegments.add(
          `${potPidPathPoint.pathId}|${potPidPathPoint.index}`
        );
        matchedSegment = true;
      }
    }

    if (!matchedSegment) return null;
  }

  return matchedSegments;
};

const getPathIdsMatched = (
  match: Set<string>,
  numPathIdsToMatch: number,
  numPathSegmentsPerPathId: Map<string, number>
): Set<string> | null => {
  const matchedPathIdAndIndexList = Array.from(match).map((m) => {
    const [pathId, index] = m.split('|');
    return { pathId, index };
  });

  const numPathSegmentsMatchedPerPathId = new Map<string, number>();
  matchedPathIdAndIndexList.forEach((m) => {
    const lastNum = numPathSegmentsMatchedPerPathId.get(m.pathId) ?? 0;
    numPathSegmentsMatchedPerPathId.set(m.pathId, lastNum + 1);
  });

  const pathIdsMatched = new Set(numPathSegmentsMatchedPerPathId.keys());

  // Remove all path segments that does not match sufficiently
  numPathSegmentsMatchedPerPathId.forEach((numPathSegmentsMatched, pathId) => {
    const numPathSemgentsToMatch = numPathSegmentsPerPathId.get(pathId);
    if (
      numPathSemgentsToMatch === undefined ||
      numPathSegmentsMatched / numPathSemgentsToMatch <
        PERCENTAGE_PATH_SEGMENTS_MATCHED_PER_PATH_ID
    ) {
      pathIdsMatched.delete(pathId);
    }
  });

  // Only accept a match if the number of path ids matched is sufficient
  if (pathIdsMatched.size / numPathIdsToMatch < PERCENTAGE_PATH_IDS_MATCHED)
    return null;

  return pathIdsMatched;
};

const acceptMatch = (numMatched: number, segmentsToMatch: number): boolean => {
  // This is an efficient hacky heuristic to make the symbol matcher as fuzzy as possible without introducing any false positives
  if (segmentsToMatch <= 30) {
    // There are so few segments that all of them must have at least one match
    if (numMatched < segmentsToMatch) return false;
  } else if (numMatched / segmentsToMatch < 0.9) return false;
  return true;
};

interface SymbolDetection {
  pathIds: string[];
  scale: number;
  rotation: number;
}

export const detectSymbols = (
  pidPaths: PidPath[],
  kdTree: KdTreePidPath,
  pidGroup: PidGroup
): SymbolDetection[] => {
  const detections: SymbolDetection[] = [];

  const numPathSegmentsPerPathId = new Map<string, number>();
  pidPaths.forEach((pidPath) => {
    numPathSegmentsPerPathId.set(pidPath.pathId, pidPath.segmentList.length);
  });
  const pathSegmentWithFillList = pidGroup.pidPaths.flatMap((pidPath) => {
    return pidPath.segmentList.map((pathSegment) => {
      return {
        pathSegment,
        isFilled: pidPath.isFilled(),
      };
    });
  });

  const pathSegments = pathSegmentWithFillList.map((p) => p.pathSegment);
  const segmentsToMatch = pathSegmentWithFillList.length;
  const usedPathIds = new Set<string>();

  const longestPathSegment = maxBy(
    pathSegments,
    (pathSegment) => pathSegment.length
  );
  if (!longestPathSegment) return [];

  const longestPathSegmentAngle = longestPathSegment.angle;
  const longestPathSegmentLength = longestPathSegment.length;
  const longestPathSegmentMidPoint = longestPathSegment.midPoint;

  for (let pidPathIndex = 0; pidPathIndex < pidPaths.length; pidPathIndex++) {
    const pidPath = pidPaths[pidPathIndex];
    if (usedPathIds.has(pidPath.pathId)) continue;

    for (
      let pathSegmentIndex = 0;
      pathSegmentIndex < pidPath.segmentList.length;
      pathSegmentIndex++
    ) {
      const pathSegment = pidPath.segmentList[pathSegmentIndex];
      const scale = pathSegment.length / longestPathSegmentLength;
      if (!approxeq(scale, 1, SCALE_THRESHOLD)) continue;

      const translation = pathSegment.midPoint.minus(
        longestPathSegmentMidPoint
      );
      const scaleOrigin = longestPathSegmentMidPoint.translate(
        translation.x,
        translation.y
      );

      const rotation1 = mod(
        Math.round(
          angleDifference(
            longestPathSegmentAngle,
            pathSegment.angle,
            'uniDirected'
          )
        ),
        180
      );
      const rotations = [rotation1, rotation1 + 180];

      let foundMatchForRotation = false;
      for (
        let rotationIndex = 0;
        rotationIndex < rotations.length;
        rotationIndex++
      ) {
        const rotation = rotations[rotationIndex];
        const match = matchesSymbol(
          kdTree,
          pathSegmentWithFillList,
          translation,
          rotations[rotationIndex],
          scale,
          scaleOrigin
        );

        if (match === null) continue;

        if (!acceptMatch(match.size, segmentsToMatch)) continue;

        const pathIdsMatched = getPathIdsMatched(
          match,
          pidGroup.pidPaths.length,
          numPathSegmentsPerPathId
        );

        if (pathIdsMatched === null) continue;

        pathIdsMatched.forEach((pathId) => {
          usedPathIds.add(pathId);
        });

        detections.push({
          pathIds: Array.from(pathIdsMatched),
          rotation,
          scale,
        });

        foundMatchForRotation = true;
        break;
      }
      if (foundMatchForRotation) break;
    }
  }

  return detections;
};

export const findAllInstancesOfSymbol = (
  pidDocument: PidDocument,
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const foundSymbolInstances: DiagramSymbolInstance[] = [];

  const pidGroup = PidGroup.fromSvgPaths(symbol.svgRepresentation.svgPaths);

  const detections = detectSymbols(
    pidDocument.pidPaths,
    pidDocument.kdTree,
    pidGroup
  );

  detections.forEach((detection) => {
    const { pathIds, scale, rotation } = detection;

    const newSymbolInstance: DiagramSymbolInstance = {
      type: symbol.symbolType,
      id: getDiagramInstanceIdFromPathIds(pathIds),
      symbolId: symbol.id,
      pathIds,
      scale,
      rotation,
      labelIds: [],
      lineNumbers: [],
      inferedLineNumbers: [],
    };

    if (symbol.direction !== undefined) {
      newSymbolInstance.direction = (symbol.direction + rotation) % 360;
    }
    foundSymbolInstances.push(newSymbolInstance);
  });

  if (symbol.symbolType === 'File Connection') {
    const fileConnections = foundSymbolInstances.filter(isFileConnection);
    return pidDocument.getFileConnectionsWithPosition(fileConnections);
  }

  return foundSymbolInstances;
};
