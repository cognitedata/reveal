/* eslint-disable no-continue */
import { isLineSegment } from '../utils';
import {
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO,
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID,
  AUTO_ANALYSIS_LINE_JUMP_THRESHOLD,
} from '../constants';
import { PidDocument, PidInstance } from '../pid';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramType,
} from '../types';
import { EdgePoint, getClosestPointsOnSegments } from '../geometry';

export const findConnectionsByTraversal = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument,
  diagramType: DiagramType
) => {
  const newConnectionsSet = new Set<string>();

  const symbols = symbolInstances.map((diagramInstance) =>
    PidInstance.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const linesToVisit = lineInstances.map((diagramInstance) =>
    PidInstance.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const allInstances = [...symbols, ...linesToVisit];

  const toVisit: PidInstance[] = [...symbols];
  const hasVisited: PidInstance[] = [];

  while (toVisit.length !== 0) {
    const potentialInstance = toVisit.pop();
    if (
      potentialInstance === undefined ||
      hasVisited.includes(potentialInstance)
    ) {
      continue;
    }
    hasVisited.push(potentialInstance);

    let closePidGroups: PidInstance[];
    if (potentialInstance.isLine) {
      closePidGroups = getClosePidInstances(
        allInstances,
        potentialInstance,
        diagramType
      );
    } else {
      // FIX: We don't try to find connections from symbol instances to symbol instances since this may
      //      introduce false positives (for instance when two caps connect to the same point on a line).
      //      A more sophisticated logic that makes sure a symbol instnace only has one connection in
      //      a given direction is left as an exercise to the reader.
      closePidGroups = getClosePidInstances(
        linesToVisit,
        potentialInstance,
        diagramType
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
  pidGroup: PidInstance;
}

const getCloseWithLineJumps = (
  lineInstance: PidInstance,
  pidInstances: PidInstance[],
  threshold: number
) => {
  const linePathSegments = lineInstance.getPathSegments();

  // This function should only be called it the `linePidGroup` only has one `LineSegment`.
  if (linePathSegments.length > 1) return [];

  const lineSegment = linePathSegments[0];
  if (!isLineSegment(lineSegment)) return [];

  const closeInstances: PidInstance[] = [];

  let closestStartConnection: ClosestConnection | undefined;
  let closestEndConnection: ClosestConnection | undefined;

  const addIfClosestStartConnection = (
    distance: number,
    pidGroup: PidInstance
  ) => {
    if (!closestStartConnection || closestStartConnection.distance > distance) {
      closestStartConnection = { distance, pidGroup };
    }
  };
  const addIfClosestEndConnection = (
    distance: number,
    pidGroup: PidInstance
  ) => {
    if (!closestEndConnection || closestEndConnection.distance > distance) {
      closestEndConnection = { distance, pidGroup };
    }
  };

  for (let i = 0; i < pidInstances.length; i++) {
    const pidGroup = pidInstances[i];
    if (lineInstance.id === pidGroup.id) continue;

    const otherPathSegments = pidGroup.getPathSegments();
    const firstOtherPathSegment = otherPathSegments[0];

    if (
      otherPathSegments.length === 1 &&
      isLineSegment(firstOtherPathSegment)
    ) {
      const lineJumpDistance = lineSegment.distanceWithLineJump(
        firstOtherPathSegment,
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
    } else if (lineInstance.isClose(pidGroup, threshold)) {
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

export const getClosePidInstances = (
  pidInstances: PidInstance[],
  instance: PidInstance,
  diagramType: DiagramType
) => {
  const threshold =
    diagramType === DiagramType.pid
      ? AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID
      : AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO;

  if (instance.isLine && instance.getPathSegments().length === 1) {
    return getCloseWithLineJumps(instance, pidInstances, threshold);
  }
  return pidInstances.filter((pidGroup) =>
    instance.isClose(pidGroup, threshold)
  );
};
