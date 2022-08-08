/* eslint-disable no-param-reassign */

import { DiagramInstance, DiagramTag, Rect, ToolType } from '../types';
import { COLORS } from '../constants';
import {
  DiagramInstanceId,
  DiagramLineInstance,
  getDiagramInstanceId,
  PidDocument,
  DiagramConnection,
  Point,
  getPointsCloserToEachOther,
  getPointTowardOtherPoint,
  connectionExists,
  DiagramInstanceWithPaths,
  DiagramSymbolInstance,
  getClosestPointsOnSegments,
  getClosestPointOnSegments,
  getEncolosingBoundingBox,
  assertNever,
  isLine,
  BoundingBox,
  getDiagramInstanceByPathId,
} from '../index';

import isNotUndefined from './isNotUndefined';

export const isNodeInLineNumber = (
  node: SVGElement,
  lineNumber: string | null,
  diagramInstances: DiagramInstanceWithPaths[]
) => {
  if (lineNumber === null) return false;

  if (node instanceof SVGTSpanElement) {
    return diagramInstances.some(
      (instance) =>
        instance.labelIds.includes(node.id) &&
        instance.lineNumbers.includes(lineNumber)
    );
  }
  const diagramInstnace = getDiagramInstanceByPathId(diagramInstances, node.id);

  if (diagramInstnace === undefined) return false;

  return diagramInstnace.lineNumbers.includes(lineNumber);
};

export const isNodeInInferedLineNumber = (
  node: SVGElement,
  lineNumber: string | null,
  diagramInstances: DiagramInstanceWithPaths[]
) => {
  if (lineNumber === null) return false;

  if (node instanceof SVGTSpanElement) {
    return diagramInstances.some(
      (instance) =>
        instance.labelIds.includes(node.id) &&
        instance.inferedLineNumbers.includes(lineNumber)
    );
  }
  const diagramInstnace = getDiagramInstanceByPathId(diagramInstances, node.id);

  if (diagramInstnace === undefined) return false;

  return diagramInstnace.inferedLineNumbers.includes(lineNumber);
};

const colorNode = (
  node: SVGElement,
  color: string | undefined,
  opacity: number | undefined = undefined
) => {
  if (color !== undefined) {
    node.style.stroke = color;
    if (node.style.fill !== 'none') {
      node.style.fill = color;
    }
  }
  if (opacity !== undefined) {
    if (node.style.fill !== 'none') {
      node.style.opacity = opacity.toString();
    } else {
      node.style.strokeOpacity = opacity.toString();
    }
  }
};

const isInActiveTag = (
  node: SVGElement,
  activeTagId: string | null,
  tags: DiagramTag[]
) => {
  if (activeTagId === null) return false;

  const activeTag = tags.find((tag) => tag.id === activeTagId);

  if (activeTag === undefined) return false;

  return activeTag.labelIds.includes(node.id);
};

const isInTags = (node: SVGElement, tags: DiagramTag[]): boolean => {
  const allNodeIds = tags.flatMap((tag) => tag.labelIds);
  return allNodeIds.includes(node.id);
};

export interface ApplyStyleArgs {
  node: SVGElement;
  diagramInstance: DiagramInstance | undefined;
  instances: DiagramInstanceWithPaths[];
  symbolSelection: string[];
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  connections: DiagramConnection[];
  activeTool: ToolType;
  activeLineNumber: string | null;
  tags: DiagramTag[];
  activeTagId: string | null;
  splitSelection: string | null;
  hideSelection: boolean;
}

export const applyStyleToNode = ({
  node,
  diagramInstance,
  instances,
  symbolSelection,
  connectionSelection,
  labelSelection,
  connections,
  activeTool,
  activeLineNumber,
  tags,
  activeTagId,
  splitSelection,
  hideSelection,
}: ApplyStyleArgs) => {
  let color: string | undefined;
  let opacity: number | undefined;

  if (diagramInstance) {
    if (isLine(diagramInstance)) {
      ({ color, opacity } = COLORS.diagramLine);
    } else {
      ({ color, opacity } = COLORS.symbol);
    }

    // isInConnectionSelection
    if (diagramInstance.id === connectionSelection) {
      colorNode(node, COLORS.connectionSelection);
      color = COLORS.connectionSelection;
    }
  }

  if (node.id === splitSelection) {
    color = COLORS.splitLine;
  }
  if (symbolSelection.includes(node.id)) {
    ({ color, opacity } = COLORS.symbolSelection);
  }

  if (isInActiveTag(node, activeTagId, tags)) {
    color = COLORS.activeLabel;
  } else if (isInTags(node, tags)) {
    color = COLORS.labelSelection;
  }

  switch (activeTool) {
    case 'setLineNumber':
      if (node instanceof SVGTSpanElement) {
        if (activeLineNumber && node.innerHTML.includes(activeLineNumber)) {
          node.style.fontWeight = '600';
          return;
        }
      }

      if (isNodeInLineNumber(node, activeLineNumber, instances)) {
        node.style.strokeWidth = `${2.5 * parseFloat(node.style.strokeWidth)}`;
        color = 'green';
      } else if (isNodeInInferedLineNumber(node, activeLineNumber, instances)) {
        node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
      } else if (diagramInstance && diagramInstance.lineNumbers.length > 0) {
        node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
        opacity = 0.3;
        color = 'green';
      } else if (
        diagramInstance &&
        diagramInstance.type !== 'Equipment' &&
        diagramInstance.inferedLineNumbers.length > 1
      ) {
        node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
        color = 'darkOrange';
      } else if (
        diagramInstance &&
        diagramInstance.inferedLineNumbers.length === 1
      ) {
        node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
        opacity = 0.1;
      } else {
        opacity = 0.45;
      }
      break;
    case 'connectLabels':
      if (diagramInstance) {
        if (diagramInstance.id === labelSelection) {
          color = COLORS.labelSelection;
        } else if (diagramInstance.assetId) {
          ({ color, opacity } = COLORS.symbolWithAsset);
        }
      }
  }

  colorNode(node, color, opacity);

  if (hideSelection && symbolSelection.some((select) => select === node.id)) {
    node.style.visibility = 'hidden';
  }

  applyPointerCursorStyleToNode({
    node,
    diagramInstance,
    activeTool,
    connectionSelection,
    labelSelection,
    connections,
  });
};

const applyPointerCursorStyleToNode = ({
  node,
  diagramInstance,
  activeTool,
  connectionSelection,
  labelSelection,
  connections,
}: {
  node: SVGElement;
  diagramInstance: DiagramInstance | undefined;
  activeTool: ToolType;
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  connections: DiagramConnection[];
}) => {
  const isSymbolInstance = diagramInstance && !isLine(diagramInstance);

  switch (activeTool) {
    case 'addSymbol':
      if (node instanceof SVGPathElement) {
        node.style.cursor = 'pointer';
      }
      break;
    case 'addLine':
      if (node instanceof SVGPathElement && !isSymbolInstance) {
        node.style.cursor = 'pointer';
      }
      break;
    case 'splitLine':
      if (node instanceof SVGPathElement) {
        if (!isSymbolInstance) {
          node.style.cursor = 'pointer';
        }
      }
      break;
    case 'connectInstances':
      if (diagramInstance === undefined) return;

      if (connectionSelection !== null) {
        // Make sure the connection does not already exist
        const connectionToCheck: DiagramConnection = {
          start: connectionSelection,
          end: diagramInstance.id,
          direction: 'unknown',
        };
        if (!connectionExists(connections, connectionToCheck)) {
          node.style.cursor = 'pointer';
        }
      } else {
        node.style.cursor = 'pointer';
      }
      break;
    case 'connectLabels':
      if (diagramInstance !== undefined) {
        node.style.cursor = 'pointer';
      }
      if (labelSelection !== null && node instanceof SVGTSpanElement) {
        node.style.cursor = 'pointer';
      }
      break;
    case 'setLineNumber':
      if (diagramInstance !== undefined) {
        node.style.cursor = 'pointer';
      }
      break;
    case 'addEquipmentTag':
      if (node instanceof SVGTSpanElement) {
        node.style.cursor = 'pointer';
      }
      break;
    default:
      assertNever(activeTool, `Unsupported active tool ${activeTool}`);
  }
};

export const colorSymbol = (
  diagramInstanceId: DiagramInstanceId,
  strokeColor: string,
  diagramInstances: DiagramInstanceWithPaths[],
  mainSvg: SVGSVGElement,
  additionalStyles?: { [key: string]: string }
) => {
  const symbolInstance = diagramInstances.filter(
    (instance) => getDiagramInstanceId(instance) === diagramInstanceId
  )[0] as DiagramInstanceWithPaths;

  if (symbolInstance) {
    symbolInstance.pathIds.forEach((pathId) => {
      Object.assign((mainSvg.getElementById(pathId) as SVGElement).style, {
        ...additionalStyles,
        stroke: strokeColor,
      });
    });
  }
};

export const scaleStrokeWidth = (scale: number, strokeWidth: string): string =>
  `${scale * parseFloat(strokeWidth)}`;

export const scaleStrokeWidthPath = (scale: number, node: SVGElement): void => {
  node.style.strokeWidth = scaleStrokeWidth(scale, node.style.strokeWidth);
};

export const scaleStrokeWidthInstance = (
  scale: number,
  diagramInstance: DiagramInstanceWithPaths,
  nodeMap: Map<string, { node: SVGElement; originalStyle: string }>
) => {
  diagramInstance.pathIds.forEach((pathId) => {
    const nodeMapData = nodeMap.get(pathId);
    if (!nodeMapData) return;

    const { node } = nodeMapData;
    scaleStrokeWidthPath(scale, node);
  });
};

export const getSvgRect = ({
  rect,
  id,
  color,
  opacity,
  strokeColor,
  strokeOpacity,
  strokeWidth,
}: {
  rect: Rect;
  id: string;
  color: string;
  opacity: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
}) => {
  const svgRect = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect'
  );

  const usedStrokeColor = strokeColor ?? color;
  const usedStrokeOpacity = strokeOpacity ?? opacity;
  const usedStrokeWidth = strokeWidth ?? 0.5;

  svgRect.setAttribute(
    'style',
    `stroke:${usedStrokeColor};stroke-width:${usedStrokeWidth};fill:${color};stroke-opacity:${usedStrokeOpacity};fill-opacity:${opacity}`
  );

  const { x, y, width, height } = rect;
  svgRect.setAttribute('x', `${x}`);
  svgRect.setAttribute('y', `${y}`);
  svgRect.setAttribute('width', `${width}`);
  svgRect.setAttribute('height', `${height}`);

  svgRect.id = id;
  return svgRect;
};

export const getSvgPath = ({
  startPoint,
  endPoint,
  id,
  color,
  opacity,
  strokeColor,
  strokeOpacity,
  strokeWidth,
}: {
  startPoint: Point;
  endPoint: Point;
  id: string;
  color: string;
  opacity: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
}) => {
  const svgPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );

  svgPath.setAttribute(
    'd',
    `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
  );

  svgPath.id = id;

  const usedStrokeColor = strokeColor ?? color;
  const usedStrokeOpacity = strokeOpacity ?? opacity;
  const usedStrokeWidth = strokeWidth ?? 0.5;

  svgPath.setAttribute(
    'style',
    `stroke:${usedStrokeColor};stroke-width:${usedStrokeWidth};fill:${color};stroke-opacity:${usedStrokeOpacity};fill-opacity:${opacity};stroke-linecap:round`
  );

  return svgPath;
};

export type ConnectionVisualization = {
  diagramConnection: DiagramConnection;
  node: SVGPathElement;
};

export const visualizeConnections = (
  svgElement: SVGElement,
  pidDocument: PidDocument,
  connections: DiagramConnection[],
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[]
): ConnectionVisualization[] => {
  const offset = 2;
  const instanceIdMap = new Map<DiagramInstanceId, DiagramInstanceWithPaths>();

  [...symbolInstances, ...lines].forEach((diagramInstance) => {
    instanceIdMap.set(diagramInstance.id, diagramInstance);
  });

  return connections
    .map((connection) => {
      const startInstance = instanceIdMap.get(connection.start);
      const endInstance = instanceIdMap.get(connection.end);
      if (startInstance === undefined || endInstance === undefined) {
        return undefined;
      }

      let startPoint: Point | undefined;
      let endPoint: Point | undefined;
      if (startInstance.type !== 'Line' && endInstance.type !== 'Line') {
        // Both is symbol
        startPoint = pidDocument.getMidPointToPaths(startInstance.pathIds);
        endPoint = pidDocument.getMidPointToPaths(endInstance.pathIds);

        [startPoint, endPoint] = getPointsCloserToEachOther(
          startPoint,
          endPoint,
          offset
        );
      } else if (startInstance.type === 'Line' && endInstance.type === 'Line') {
        // Both is line

        const startPathSegments = pidDocument.getPathSegmentsToPaths(
          startInstance.pathIds
        );
        const endPathSegments = pidDocument.getPathSegmentsToPaths(
          endInstance.pathIds
        );

        const closestPoints = getClosestPointsOnSegments(
          startPathSegments,
          endPathSegments
        );

        if (closestPoints === undefined) {
          return undefined;
        }

        startPoint = closestPoints.point1;
        endPoint = closestPoints.point2;
      } else {
        // One symbol and one line
        const [symbol, line] =
          startInstance.type !== 'Line'
            ? [startInstance, endInstance]
            : [endInstance, startInstance];

        const symbolPoint = pidDocument.getMidPointToPaths(symbol.pathIds);
        const lineSegments = pidDocument.getPathSegmentsToPaths(line.pathIds);

        const closestPoint = getClosestPointOnSegments(
          symbolPoint,
          lineSegments
        );
        if (closestPoint === undefined) {
          return undefined;
        }

        if (closestPoint.percentAlongPath < 0.05) {
          endPoint = getPointTowardOtherPoint(
            closestPoint.point,
            lineSegments[closestPoint.index].stop,
            offset
          );
        } else if (closestPoint.percentAlongPath > 0.95) {
          endPoint = getPointTowardOtherPoint(
            closestPoint.point,
            lineSegments[closestPoint.index].start,
            offset
          );
        } else {
          endPoint = closestPoint.point;
        }
        startPoint = getPointTowardOtherPoint(symbolPoint, endPoint, offset);
      }

      const svgPath = getSvgPath({
        startPoint,
        endPoint,
        id: `convis-${connection.start}-${connection.end}`,
        color: COLORS.connection.color,
        strokeWidth: COLORS.connection.strokeWidth,
        opacity: COLORS.connection.opacity,
      });

      svgElement.appendChild(svgPath);
      return {
        diagramConnection: connection,
        node: svgPath,
      };
    })
    .filter(isNotUndefined);
};

export type LabelVisualization = {
  diagramInstance: DiagramInstanceWithPaths;
  labels: {
    labelId: string;
    textNode: SVGPathElement;
    boundingBoxNode: SVGRectElement;
  }[];
};

export const visualizeLabelsToInstances = (
  svgElement: SVGElement,
  pidDocument: PidDocument,
  instances: DiagramInstanceWithPaths[]
): LabelVisualization[] => {
  return instances.map((instance) => {
    const instanceMidPoint = pidDocument.getMidPointToPaths(instance.pathIds);

    return {
      diagramInstance: instance,
      labels: instance.labelIds
        .map((labelId) => {
          const pidTspan = pidDocument.getPidTspanById(labelId);
          if (pidTspan === null) {
            return undefined;
          }

          const svgRect = getSvgRect({
            rect: pidTspan.boundingBox,
            id: `tspanrect_${pidTspan.id}`,
            color: COLORS.connection.color,
            opacity: 0.1,
          });
          svgElement.appendChild(svgRect);

          const labelPoint = pidTspan.getMidPoint();
          const svgPath = getSvgPath({
            startPoint: instanceMidPoint,
            endPoint: labelPoint,
            id: `labelConnection-${labelId}-${getDiagramInstanceId(instance)}`,
            color: COLORS.connection.color,
            strokeWidth: COLORS.connection.strokeWidth / 2,
            opacity: COLORS.connection.opacity,
          });
          svgElement.appendChild(svgPath);

          return {
            labelId,
            textNode: svgPath,
            boundingBoxNode: svgRect,
          };
        })
        .filter(isNotUndefined),
    };
  });
};

export const visualizeSymbolInstanceBoundingBoxes = (
  svgElement: SVGElement,
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  padding = 1
): string[] => {
  return symbolInstances.map((symbolInstance) => {
    const rect = BoundingBox.fromRect(
      pidDocument.getBoundingBoxToPaths(symbolInstance.pathIds)
    )
      .pad(padding)
      .toRect();

    const svgRect = getSvgRect({
      rect,
      id: `symbolinstancerect_${symbolInstance.id}`,
      color: COLORS.symbolBoundingBox.color,
      opacity: COLORS.symbolBoundingBox.opacity,
      strokeColor: COLORS.symbolBoundingBox.strokeColor,
      strokeOpacity: COLORS.symbolBoundingBox.strokeOpacity,
      strokeWidth: COLORS.symbolBoundingBox.strokeWidth,
    });

    svgElement.appendChild(svgRect);
    return svgRect.id;
  });
};

export const visualizeTagBoundingBoxes = (
  svgElement: SVGElement,
  pidDocument: PidDocument,
  tags: DiagramTag[]
): string[] => {
  return tags.map((tag) => {
    const svgRect = getSvgRect({
      rect: getEncolosingBoundingBox(
        tag.labelIds.map(
          (labelId) => pidDocument.getPidTspanById(labelId)!.boundingBox
        )
      ),
      id: `tag_${tag.id}`,
      color: COLORS.symbolBoundingBox.color,
      opacity: COLORS.symbolBoundingBox.opacity,
      strokeColor: COLORS.symbolBoundingBox.strokeColor,
      strokeOpacity: COLORS.symbolBoundingBox.strokeOpacity,
      strokeWidth: COLORS.symbolBoundingBox.strokeWidth,
    });
    svgElement.appendChild(svgRect);
    return svgRect.id;
  });
};

export const applyToLeafSVGElements = (
  svg: SVGSVGElement,
  callback: (node: SVGElement) => void
): void => {
  const traverse = (node: SVGElement) => {
    if (node.children.length === 0) {
      if (node instanceof SVGElement) {
        callback(node);
      }
      return;
    }
    if (node instanceof SVGClipPathElement) {
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      traverse(node.children[i] as SVGElement);
    }
  };

  traverse(svg);
};
