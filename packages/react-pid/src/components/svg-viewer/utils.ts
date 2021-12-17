import {
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
  DiagramLabel,
  PidDocument,
  DiagramConnection,
  getInstanceByDiagramInstanceId,
  getClosestPathSegments,
  Point,
  getPointsCloserToEachOther,
  getPointTowardOtherPoint,
} from '@cognite/pid-tools';

import { ToolType } from '../../types';
import { COLORS } from '../../constants';

export const isDiagramLine = (
  node: SVGElement,
  lines: DiagramLineInstance[]
) => {
  return lines.some((line) => line.pathIds.includes(node.id));
};

export const isSymbolInstance = (
  node: SVGElement,
  symbolInstances: DiagramSymbolInstance[]
) => {
  return symbolInstances.some((symbolInst) =>
    symbolInst.pathIds.includes(node.id)
  );
};

export const isInConnectionSelection = (
  node: SVGElement,
  connectionSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, connectionSelection);
};

export const isInAddSymbolSelection = (
  node: SVGElement,
  selection: SVGElement[]
) => {
  return selection.some((svgPath) => svgPath.id === node.id);
};

export const isInLabelSelection = (
  node: SVGElement,
  labelSelection: DiagramInstanceId | null
) => {
  return labelSelection === node.id;
};

export const isLabelInInstance = (
  instance: DiagramSymbolInstance,
  id: DiagramInstanceId
): boolean => {
  return !!instance.labels?.some(
    (labelInInstance) => labelInInstance.id === id
  );
};

export const isLabelInInstances = (
  node: SVGElement,
  symbolInstances: DiagramSymbolInstance[]
) => {
  return symbolInstances.some((instance) =>
    isLabelInInstance(instance, node.id)
  );
};

const getInstanceLabelIndex = (
  instance: DiagramSymbolInstance,
  id: string
): number => {
  if (instance.labels === undefined) return -1;

  return instance.labels.findIndex(
    (labelOnInstance) => labelOnInstance.id === id
  );
};

export const isInGraphSelection = (
  node: SVGElement,
  graphSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, graphSelection);
};

/* eslint-disable no-param-reassign */
export const applyStyleToNode = (
  node: SVGElement,
  selection: SVGElement[],
  connectionSelection: DiagramInstanceId | null,
  labelSelection: DiagramInstanceId | null,
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[],
  graphPaths: DiagramInstanceId[][],
  graphSelection: DiagramInstanceId | null,
  active: ToolType
) => {
  if (isDiagramLine(node, lines) || isLabelInInstances(node, lines)) {
    node.style.stroke = COLORS.diagramLine;
  }
  if (
    isSymbolInstance(node, symbolInstances) ||
    isLabelInInstances(node, symbolInstances)
  ) {
    node.style.stroke = COLORS.symbol;
  }
  if (isInConnectionSelection(node, connectionSelection)) {
    node.style.stroke = COLORS.connectionSelection;
  }
  if (isInLabelSelection(node, labelSelection)) {
    node.style.stroke = COLORS.labelSelection;
  }
  if (isInAddSymbolSelection(node, selection)) {
    node.style.stroke = COLORS.symbolSelection;
  }
  if (active === 'connectLabels' && node instanceof SVGTSpanElement) {
    node.style.cursor = 'pointer';
  }
  if (isInGraphSelection(node, graphSelection)) {
    node.style.stroke = COLORS.connectionSelection;
  }
};
/* eslint-enable no-param-reassign */

export const addOrRemoveLabelToInstance = (
  node: SVGElement,
  pidLabel: DiagramLabel,
  instance: DiagramSymbolInstance | DiagramLineInstance,
  instances: DiagramSymbolInstance[] | DiagramLineInstance[],
  setter: (arg: DiagramSymbolInstance[] | DiagramLineInstance[]) => void
) => {
  const newInstance = instance;
  if (newInstance.labels === undefined) {
    newInstance.labels = [];
  }

  const labelIndex = getInstanceLabelIndex(newInstance, node.id);
  if (labelIndex === -1) {
    newInstance.labels.push(pidLabel);
  } else {
    newInstance.labels.splice(labelIndex, 1);
  }
  setter(
    instances.map((oldInstance) => {
      if (oldInstance.pathIds === newInstance.pathIds) {
        return newInstance;
      }
      return oldInstance;
    })
  );
};

export const colorSymbol = (
  diagramInstanceId: string,
  strokeColor: string,
  symbolInstances: DiagramSymbolInstance[],
  additionalStyles?: { [key: string]: string }
) => {
  const symbolInstance = symbolInstances.filter(
    (instance) => getDiagramInstanceId(instance) === diagramInstanceId
  )[0] as DiagramSymbolInstance;

  if (symbolInstance) {
    symbolInstance.pathIds.forEach((pathId) => {
      Object.assign(
        (document.getElementById(pathId) as unknown as SVGElement).style,
        {
          ...additionalStyles,
          stroke: strokeColor,
        }
      );
    });
  }
};

export const visualizeConnections = (
  svg: SVGSVGElement,
  pidDocument: PidDocument,
  connections: DiagramConnection[],
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[]
) => {
  const offset = 2;
  const maxLength = 10;
  const intersectionThreshold = 3;
  const instances = [...symbolInstances, ...lines];
  connections.forEach((connection) => {
    const startInstance = getInstanceByDiagramInstanceId(
      instances,
      connection.start
    );
    const endInstance = getInstanceByDiagramInstanceId(
      instances,
      connection.end
    );
    if (startInstance === undefined || endInstance === undefined) return;

    let startPoint: Point | undefined;
    let endPoint: Point | undefined;
    if (
      startInstance.symbolName !== 'Line' &&
      endInstance.symbolName !== 'Line'
    ) {
      // Both is symbol
      startPoint = pidDocument.getMidPointToPaths(startInstance.pathIds);
      endPoint = pidDocument.getMidPointToPaths(endInstance.pathIds);

      [startPoint, endPoint] = getPointsCloserToEachOther(
        startPoint,
        endPoint,
        offset
      );
    } else if (
      startInstance.symbolName === 'Line' &&
      endInstance.symbolName === 'Line'
    ) {
      // Both is line

      const startPathSegments = pidDocument.getPathSegmentsToPaths(
        startInstance.pathIds
      );
      const endPathSegments = pidDocument.getPathSegmentsToPaths(
        endInstance.pathIds
      );

      const [startPathSegment, endPathSegment] = getClosestPathSegments(
        startPathSegments,
        endPathSegments
      );

      const intersection = startPathSegment.getIntersection(endPathSegment);
      if (intersection === undefined) {
        startPoint = startPathSegment.midPoint;
        endPoint = endPathSegment.midPoint;
      } else {
        if (
          intersection.distance(startPathSegment.start) <
            intersectionThreshold ||
          intersection.distance(startPathSegment.stop) < intersectionThreshold
        ) {
          startPoint = getPointTowardOtherPoint(
            intersection,
            startPathSegment.midPoint,
            Math.min(
              maxLength,
              intersection.distance(startPathSegment.midPoint) - offset
            )
          );
        } else {
          startPoint = intersection;
        }

        if (
          intersection.distance(endPathSegment.start) < intersectionThreshold ||
          intersection.distance(endPathSegment.stop) < intersectionThreshold
        ) {
          endPoint = getPointTowardOtherPoint(
            intersection,
            endPathSegment.midPoint,
            Math.min(
              maxLength,
              intersection.distance(endPathSegment.midPoint) - offset
            )
          );
        } else {
          endPoint = intersection;
        }
      }
    } else {
      // One symbol and one line
      const [symbol, line] =
        startInstance.symbolName !== 'Line'
          ? [startInstance, endInstance]
          : [endInstance, startInstance];

      const symbolPoint = pidDocument.getMidPointToPaths(symbol.pathIds);

      // Use path segment with start/stop point closest to `symbolPoint`
      let linePoint: undefined | Point;
      const linePathSegments = pidDocument.getPathSegmentsToPaths(line.pathIds);
      let minDistance = Infinity;
      linePathSegments.forEach((pathSegment) => {
        const startDistance = symbolPoint.distance(pathSegment.start);
        if (startDistance < minDistance) {
          minDistance = startDistance;
          linePoint = getPointTowardOtherPoint(
            pathSegment.start,
            pathSegment.stop,
            Math.min(
              maxLength,
              pathSegment.start.distance(pathSegment.midPoint)
            )
          );
        }

        const stopDistance = symbolPoint.distance(pathSegment.stop);
        if (stopDistance < minDistance) {
          minDistance = stopDistance;
          linePoint = getPointTowardOtherPoint(
            pathSegment.stop,
            pathSegment.start,
            Math.min(maxLength, pathSegment.stop.distance(pathSegment.midPoint))
          );
        }
      });

      startPoint = symbolPoint;
      endPoint = linePoint;
      if (endPoint === undefined) return;

      [startPoint, endPoint] = getPointsCloserToEachOther(
        startPoint,
        endPoint,
        offset
      );
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
    );

    path.setAttribute(
      'style',
      `stroke:${COLORS.connection.color};stroke-width:${COLORS.connection.strokeWidth};opacity:${COLORS.connection.opacity};stroke-linecap:round`
    );
    svg.insertBefore(path, svg.children[0]);
  });
};
