/* eslint-disable no-continue */
import { isLineSegment } from '../utils';
import {
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO,
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID,
  AUTO_ANALYSIS_LINE_JUMP_THRESHOLD,
} from '../constants';
import { PidDocument, PidGroup } from '../pid';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DocumentType,
} from '../types';
import { EdgePoint, getClosestPointsOnSegments } from '../geometry';

export const findConnectionsByTraversal = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument,
  documentType: DocumentType
) => {
  const newConnectionsSet = new Set<string>();

  const symbols = symbolInstances.map((diagramInstance) =>
    PidGroup.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const linesToVisit = lineInstances.map((diagramInstance) =>
    PidGroup.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const allInstances = [...symbols, ...linesToVisit];

  const toVisit: PidGroup[] = [...symbols];
  const hasVisited: PidGroup[] = [];

  while (toVisit.length !== 0) {
    const potentialInstance = toVisit.pop();
    if (
      potentialInstance === undefined ||
      hasVisited.includes(potentialInstance)
    ) {
      continue;
    }
    hasVisited.push(potentialInstance);

    let closePidGroups: PidGroup[];
    if (potentialInstance.isLine) {
      closePidGroups = getClosePidGroups(
        allInstances,
        potentialInstance,
        documentType
      );
    } else {
      // FIX: We don't try to find connections from symbol instances to symbol instances since this may
      //      introduce false positives (for instance when two caps connect to the same point on a line).
      //      A more sophisticated logic that makes sure a symbol instnace only has one connection in
      //      a given direction is left as an exercise to the reader.
      closePidGroups = getClosePidGroups(
        linesToVisit,
        potentialInstance,
        documentType
      );
    }

    closePidGroups.forEach((closePidGroup) => {
      if (potentialInstance.id !== closePidGroup.id) {
        if (!hasVisited.includes(closePidGroup)) {
          toVisit.push(closePidGroup);
        }
        newConnectionsSet.add(
          [potentialInstance.id, closePidGroup.id].sort().join('|')
        );
      }
    });
  }

  const newConnections: DiagramConnection[] = [];
  newConnectionsSet.forEach((connectionIds) => {
    const ids = connectionIds.split('|');
    if (ids.length !== 2) {
      throw new Error(`Unable to use '|' as instance ID separator`);
    }
    newConnections.push({
      start: ids[0],
      end: ids[1],
      direction: 'unknown',
    });
  });
  return newConnections;
};

const edgeThreshold = 0.05;
interface ClosestConnection {
  distance: number;
  pidGroup: PidGroup;
}

const getCloseWithLineJumps = (
  linePidGroup: PidGroup,
  pidGroups: PidGroup[],
  threshold: number
) => {
  const linePathSegments = linePidGroup.getPathSegments();

  // This function should only be called it the `linePidGroup` only has one `LineSegment`.
  if (linePathSegments.length > 1) return [];

  const lineSegment = linePathSegments[0];
  if (!isLineSegment(lineSegment)) return [];

  const closeInstances: PidGroup[] = [];

  let closestStartConnection: ClosestConnection | undefined;
  let closestEndConnection: ClosestConnection | undefined;

  const addIfClosestStartConnection = (
    distance: number,
    pidGroup: PidGroup
  ) => {
    if (!closestStartConnection || closestStartConnection.distance > distance) {
      closestStartConnection = { distance, pidGroup };
    }
  };
  const addIfClosestEndConnection = (distance: number, pidGroup: PidGroup) => {
    if (!closestEndConnection || closestEndConnection.distance > distance) {
      closestEndConnection = { distance, pidGroup };
    }
  };

  for (let i = 0; i < pidGroups.length; i++) {
    const pidGroup = pidGroups[i];
    if (linePidGroup.id === pidGroup.id) continue;

    const otherPathSegments = pidGroup.getPathSegments();

    if (otherPathSegments.length === 1 && isLineSegment(otherPathSegments[0])) {
      const lineJumpDistance = lineSegment.distanceWithLineJump(
        otherPathSegments[0],
        edgeThreshold
      );

      // Is close enough so it don't need to be a line jump
      if (lineJumpDistance.distance < threshold) {
        if (lineJumpDistance.thisClosestPoint === EdgePoint.Start) {
          addIfClosestStartConnection(lineJumpDistance.distance, pidGroup);
        } else if (lineJumpDistance.thisClosestPoint === EdgePoint.Stop) {
          addIfClosestEndConnection(lineJumpDistance.distance, pidGroup);
        } else {
          closeInstances.push(pidGroup);
        }
      }

      // Check for line jump
      if (
        lineJumpDistance.isLineJump &&
        lineJumpDistance.distance < AUTO_ANALYSIS_LINE_JUMP_THRESHOLD
      ) {
        if (lineJumpDistance.thisClosestPoint === EdgePoint.Start) {
          addIfClosestStartConnection(lineJumpDistance.distance, pidGroup);
        } else if (lineJumpDistance.thisClosestPoint === EdgePoint.Stop) {
          addIfClosestEndConnection(lineJumpDistance.distance, pidGroup);
        }
      }
    } else if (linePidGroup.isClose(pidGroup, threshold)) {
      const closestData = getClosestPointsOnSegments(
        linePathSegments,
        pidGroup.getPathSegments()
      );
      if (closestData === undefined) continue;

      if (closestData.percentAlongPath1 < edgeThreshold) {
        addIfClosestStartConnection(closestData.distance, pidGroup);
      } else if (closestData.percentAlongPath1 > 1 - edgeThreshold) {
        addIfClosestEndConnection(closestData.distance, pidGroup);
      } else {
        closeInstances.push(pidGroup);
      }
    }
  }

  if (closestStartConnection) {
    closeInstances.push(closestStartConnection.pidGroup);
  }
  if (closestEndConnection) {
    closeInstances.push(closestEndConnection.pidGroup);
  }
  return closeInstances;
};

export const getClosePidGroups = (
  pidGroups: PidGroup[],
  instance: PidGroup,
  documentType: DocumentType
) => {
  const threshold =
    documentType === DocumentType.pid
      ? AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID
      : AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO;

  if (instance.isLine && instance.getPathSegments().length === 1) {
    return getCloseWithLineJumps(instance, pidGroups, threshold);
  }
  return pidGroups.filter((pidGroup) => instance.isClose(pidGroup, threshold));
};
