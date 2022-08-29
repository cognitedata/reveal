/* eslint-disable no-continue */
import min from 'lodash/min';
import inRange from 'lodash/inRange';

import { isLineSegment } from '../utils';
import { AUTO_ANALYSIS_THRESHOLD } from '../constants';
import { PidDocument, PidInstance } from '../pid';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../types';
import {
  angleDifference,
  BoundingBox,
  EndPoint,
  getClosestPointsOnSegments,
} from '../geometry';

export const findConnectionsByTraversal = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument
) => {
  const symbolToSymbolThreshold =
    pidDocument.viewBox.width * AUTO_ANALYSIS_THRESHOLD.SYMBOL_TO_SYMBOL;
  const symbolToLineThreshold =
    pidDocument.viewBox.width * AUTO_ANALYSIS_THRESHOLD.SYMBOL_TO_LINE;
  const lineToLineThreshold =
    pidDocument.viewBox.width * AUTO_ANALYSIS_THRESHOLD.LINE_TO_LINE;
  const lineJumpThreshold =
    pidDocument.viewBox.width * AUTO_ANALYSIS_THRESHOLD.LINE_JUMP;
  const pruneConnectionStartPointThreshold =
    pidDocument.viewBox.width *
    AUTO_ANALYSIS_THRESHOLD.PRUNE_CONNECTION_START_POINT;

  const newConnectionsSet = new Set<string>();

  const symbols = symbolInstances.map((diagramInstance) =>
    PidInstance.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const linesToVisit = lineInstances.map((diagramInstance) =>
    PidInstance.fromDiagramInstance(pidDocument, diagramInstance)
  );

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

    const unprunedClosePidInstances = getClosePidInstances({
      instance: potentialInstance,
      symbolInstances: symbols,
      lineInstances: linesToVisit,
      symbolToSymbolThreshold,
      symbolToLineThreshold,
      lineToLineThreshold,
      lineJumpThreshold,
    }).filter((pidInstance) => pidInstance.id !== potentialInstance.id);

    const closePidInstances = pruneClosePidInstances(
      potentialInstance,
      unprunedClosePidInstances,
      pruneConnectionStartPointThreshold
    );

    closePidInstances.forEach((closePidGroup) => {
      if (!hasVisited.includes(closePidGroup)) {
        toVisit.push(closePidGroup);
      }
      newConnectionsSet.add(
        [potentialInstance.id, closePidGroup.id].sort().join('|')
      );
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

const endPointThreshold = 0.05;
interface ClosestConnection {
  distance: number;
  pidInstance: PidInstance;
}

const getCloseWithLineJumps = ({
  lineInstance,
  pidInstances,
  symbolToLineThreshold,
  lineToLineThreshold,
  lineJumpThreshold,
}: {
  lineInstance: PidInstance;
  pidInstances: PidInstance[];
  symbolToLineThreshold: number;
  lineToLineThreshold: number;
  lineJumpThreshold: number;
}) => {
  const linePathSegments = lineInstance.getPathSegments();

  if (linePathSegments.length > 1)
    throw new Error(
      'This function should only be called it the `lineInstance` only has one `LineSegment` (has multiple segments)'
    );

  const lineSegment = linePathSegments[0];
  if (!isLineSegment(lineSegment))
    throw new Error(
      'This function should only be called it the `lineInstance` only has one `LineSegment` (is not `LineSegment`)'
    );

  const closeInstances: PidInstance[] = [];

  let closestStartConnection: ClosestConnection | undefined;
  let closestEndConnection: ClosestConnection | undefined;

  const addIfClosestStartConnection = (
    distance: number,
    pidInstance: PidInstance
  ) => {
    if (!closestStartConnection || closestStartConnection.distance > distance) {
      closestStartConnection = { distance, pidInstance };
    }
  };
  const addIfClosestEndConnection = (
    distance: number,
    pidInstance: PidInstance
  ) => {
    if (!closestEndConnection || closestEndConnection.distance > distance) {
      closestEndConnection = { distance, pidInstance };
    }
  };

  for (let i = 0; i < pidInstances.length; i++) {
    const pidInstance = pidInstances[i];
    if (lineInstance.id === pidInstance.id) continue;

    const otherPathSegments = pidInstance.getPathSegments();
    const firstOtherPathSegment = otherPathSegments[0];

    if (
      otherPathSegments.length === 1 &&
      isLineSegment(firstOtherPathSegment)
    ) {
      const distanceWithLineJump = lineSegment.distanceWithLineJump(
        firstOtherPathSegment,
        endPointThreshold
      );

      // Is close enough so it doesn't need to be a line jump
      if (distanceWithLineJump.distance < lineToLineThreshold) {
        if (distanceWithLineJump.thisClosestPoint === EndPoint.Start) {
          addIfClosestStartConnection(
            distanceWithLineJump.distance,
            pidInstance
          );
        } else if (distanceWithLineJump.thisClosestPoint === EndPoint.Stop) {
          addIfClosestEndConnection(distanceWithLineJump.distance, pidInstance);
        } else {
          closeInstances.push(pidInstance);
        }
      }

      // Check for line jump
      if (
        distanceWithLineJump.isLineJump &&
        distanceWithLineJump.distance < lineJumpThreshold
      ) {
        if (distanceWithLineJump.thisClosestPoint === EndPoint.Start) {
          addIfClosestStartConnection(
            distanceWithLineJump.distance,
            pidInstance
          );
        } else if (distanceWithLineJump.thisClosestPoint === EndPoint.Stop) {
          addIfClosestEndConnection(distanceWithLineJump.distance, pidInstance);
        }
      }
    } else if (lineInstance.isClose(pidInstance, symbolToLineThreshold)) {
      const closestData = getClosestPointsOnSegments(
        linePathSegments,
        pidInstance.getPathSegments()
      );
      if (closestData === undefined) continue;

      if (closestData.percentAlongPath1 < endPointThreshold) {
        addIfClosestStartConnection(closestData.distance, pidInstance);
      } else if (closestData.percentAlongPath1 > 1 - endPointThreshold) {
        addIfClosestEndConnection(closestData.distance, pidInstance);
      }
    }
  }

  if (closestStartConnection) {
    closeInstances.push(closestStartConnection.pidInstance);
  }
  if (closestEndConnection) {
    closeInstances.push(closestEndConnection.pidInstance);
  }
  return closeInstances;
};

const getCloseSymbolToLine = (
  symbol: PidInstance,
  lineInstances: PidInstance[],
  threshold: number
) => {
  const smallSymbolBoundingBox = BoundingBox.fromRect(symbol.boundingBox).pad(
    -(1 / 5) * min([symbol.boundingBox.width, symbol.boundingBox.height])!
  );

  return lineInstances.filter((lineInstance) => {
    if (symbol.efficientIsFartherAway(lineInstance, threshold)) return false;

    const connectionPoints =
      symbol.getPathSegmentsConnectionPoints(lineInstance)!;

    if (
      connectionPoints.distance > threshold ||
      inRange(connectionPoints.percentAlongPath2, 0.1, 0.9)
    )
      return false;

    const pointsTowardSymbol = lineInstance
      .getPathSegments()
      .some((pathSegment) =>
        smallSymbolBoundingBox.encloses(
          pathSegment.getClosestPointOnSegment(symbol.midPoint, false)
            .pointOnSegment
        )
      );

    return pointsTowardSymbol;
  });
};

export const getClosePidInstances = ({
  instance,
  symbolInstances,
  lineInstances,
  symbolToSymbolThreshold,
  symbolToLineThreshold,
  lineToLineThreshold,
  lineJumpThreshold,
}: {
  instance: PidInstance;
  symbolInstances: PidInstance[];
  lineInstances: PidInstance[];
  symbolToSymbolThreshold: number;
  symbolToLineThreshold: number;
  lineToLineThreshold: number;
  lineJumpThreshold: number;
}): PidInstance[] => {
  if (instance.isLine) {
    if (instance.getPathSegments().length === 1) {
      return getCloseWithLineJumps({
        lineInstance: instance,
        pidInstances: [...symbolInstances, ...lineInstances],
        symbolToLineThreshold,
        lineToLineThreshold,
        lineJumpThreshold,
      });
    }

    return lineInstances.filter((lineInstance) =>
      instance.isClose(lineInstance, lineToLineThreshold)
    );
  }

  // `instance` is a symbolInstance
  return [
    ...getCloseSymbolToLine(instance, lineInstances, symbolToLineThreshold),
    ...symbolInstances.filter((symbolInstance) =>
      instance.isClose(symbolInstance, symbolToSymbolThreshold)
    ),
  ];
};

export const pruneClosePidInstances = (
  instance: PidInstance,
  pidInstances: PidInstance[],
  distanceTheshold: number
): PidInstance[] => {
  const angleTheshold = 10;

  const connectionSegments = pidInstances.map((pidInstance) =>
    instance.getConnectionSegment(pidInstance)
  );

  const pidInstancesToPrune = new Set<string>();

  for (let i = 0; i < connectionSegments.length; i++) {
    const connectionSegments1 = connectionSegments[i];
    for (let j = i + 1; j < connectionSegments.length; j++) {
      const connectionSegments2 = connectionSegments[j];
      const startPointsDistance = connectionSegments1.start.distance(
        connectionSegments2.start
      );
      const angleDiff = angleDifference(
        connectionSegments1.angle,
        connectionSegments2.angle,
        'directed'
      );
      if (
        startPointsDistance < distanceTheshold &&
        Math.abs(angleDiff) < angleTheshold
      ) {
        if (connectionSegments1.length < connectionSegments2.length) {
          pidInstancesToPrune.add(pidInstances[j].id);
        } else {
          pidInstancesToPrune.add(pidInstances[i].id);
        }
      }
    }
  }

  return pidInstances.filter(
    (pidInstance) => !pidInstancesToPrune.has(pidInstance.id)
  );
};
