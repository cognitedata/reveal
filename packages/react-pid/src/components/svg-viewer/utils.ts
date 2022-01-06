/* eslint-disable no-param-reassign */
import {
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
  PidDocument,
  DiagramConnection,
  getInstanceByDiagramInstanceId,
  getClosestPathSegments,
  Point,
  getPointsCloserToEachOther,
  getPointTowardOtherPoint,
  connectionExists,
  getDiagramInstanceByPathId,
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
  return isPathIdInInstance(node.id, labelSelection);
};

export const isLabelInInstance = (
  instance: DiagramSymbolInstance,
  id: DiagramInstanceId
): boolean => {
  return instance.labelIds.includes(id);
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
  return instance.labelIds.findIndex((labelId) => labelId === id);
};

export const isInGraphSelection = (
  node: SVGElement,
  graphSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, graphSelection);
};

const colorNode = (
  node: SVGElement,
  color: string,
  opacity: number | undefined = undefined
) => {
  node.style.stroke = color;
  if (node.style.fill !== 'none') {
    node.style.fill = color;
  }
  if (opacity !== undefined) {
    if (node.style.fill !== 'none') {
      node.style.opacity = opacity.toString();
    } else {
      node.style.strokeOpacity = opacity.toString();
    }
  }
};

export const applyStyleToNode = (
  node: SVGElement,
  selection: SVGElement[],
  connectionSelection: DiagramInstanceId | null,
  labelSelection: DiagramInstanceId | null,
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[],
  connections: DiagramConnection[],
  graphPaths: DiagramInstanceId[][],
  graphSelection: DiagramInstanceId | null,
  active: ToolType
) => {
  if (isDiagramLine(node, lines) || isLabelInInstances(node, lines)) {
    colorNode(node, COLORS.diagramLine.color, COLORS.diagramLine.opacity);
  }
  if (
    isSymbolInstance(node, symbolInstances) ||
    isLabelInInstances(node, symbolInstances)
  ) {
    colorNode(node, COLORS.symbol.color, COLORS.symbol.opacity);
  }
  if (isInConnectionSelection(node, connectionSelection)) {
    colorNode(node, COLORS.connectionSelection);
  }
  if (isInLabelSelection(node, labelSelection)) {
    colorNode(node, COLORS.labelSelection);
  }
  if (isInAddSymbolSelection(node, selection)) {
    colorNode(
      node,
      COLORS.symbolSelection.color,
      COLORS.symbolSelection.opacity
    );
  }
  if (isInGraphSelection(node, graphSelection)) {
    colorNode(node, COLORS.connectionSelection);
  }

  applyPointerCursorStyleToNode({
    node,
    active,
    connectionSelection,
    labelSelection,
    symbolInstances,
    lines,
    connections,
  });
};

interface CursorStyleOptions {
  node: SVGElement;
  active: ToolType;
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
  connections: DiagramConnection[];
}

const applyPointerCursorStyleToNode = ({
  node,
  active,
  connectionSelection,
  labelSelection,
  symbolInstances,
  lines,
  connections,
}: CursorStyleOptions) => {
  if (active === 'addSymbol') {
    if (node instanceof SVGPathElement) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'addLine') {
    if (
      node instanceof SVGPathElement &&
      !isSymbolInstance(node, symbolInstances)
    ) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'connectInstances') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      // Make sure the connection does not already exist
      if (connectionSelection !== null) {
        const symbolInstance = getDiagramInstanceByPathId(
          [...symbolInstances, ...lines],
          node.id
        )!;
        const instanceId = getDiagramInstanceId(symbolInstance);
        const newConnection = {
          start: connectionSelection,
          end: instanceId,
          direction: 'unknown',
        } as DiagramConnection;
        if (!connectionExists(connections, newConnection)) {
          node.style.cursor = 'pointer';
        }
      } else {
        node.style.cursor = 'pointer';
      }
    }
  } else if (active === 'connectLabels') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      node.style.cursor = 'pointer';
    }
    if (labelSelection !== null && node instanceof SVGTSpanElement) {
      node.style.cursor = 'pointer';
    }
  }
};

export const addOrRemoveLabelToInstance = (
  node: SVGElement,
  labelId: string,
  instance: DiagramSymbolInstance | DiagramLineInstance,
  instances: DiagramSymbolInstance[] | DiagramLineInstance[],
  setter: (arg: DiagramSymbolInstance[] | DiagramLineInstance[]) => void
) => {
  const labelIndex = getInstanceLabelIndex(instance, node.id);
  if (labelIndex === -1) {
    instance.labelIds.push(labelId);
  } else {
    instance.labelIds.splice(labelIndex, 1);
  }
  setter(
    instances.map((oldInstance) => {
      if (oldInstance.pathIds === instance.pathIds) {
        return instance;
      }
      return oldInstance;
    })
  );
};

export const colorSymbol = (
  diagramInstanceId: DiagramInstanceId,
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

export const setStrokeWidth = (
  diagramInstance: DiagramSymbolInstance,
  strokeWidth: string
) => {
  diagramInstance.pathIds.forEach((pathId) => {
    (
      document.getElementById(pathId) as unknown as SVGElement
    ).style.strokeWidth = strokeWidth;
  });
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
