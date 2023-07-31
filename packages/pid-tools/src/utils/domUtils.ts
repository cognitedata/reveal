/* eslint-disable no-param-reassign */

import { DiagramInstance, DiagramTag, Rect, ToolType } from '../types';
import { COLORS } from '../constants';
import {
  DiagramInstanceId,
  DiagramLineInstance,
  PidDocument,
  DiagramConnection,
  Point,
  connectionExists,
  DiagramInstanceWithPaths,
  DiagramSymbolInstance,
  getEncolosingBoundingBox,
  assertNever,
  isLine,
  BoundingBox,
  getDiagramInstanceByPathId,
  PidInstance,
  isFileConnection,
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
  graphQuerySelection: DiagramInstanceId | null;
  graphQueryInstances: DiagramInstance[];
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
  graphQuerySelection,
  graphQueryInstances,
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

  const BACKGROUND_OPACAITY = 0.35;
  const HIGHLIGHT_SCALE_FACTOR = 1.8;

  switch (activeTool) {
    case 'setLineNumber': {
      if (node instanceof SVGTSpanElement) {
        if (activeLineNumber && node.innerHTML.includes(activeLineNumber)) {
          node.style.fontWeight = '600';
          break;
        }
      }

      if (isNodeInLineNumber(node, activeLineNumber, instances)) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
        color = 'green';
      } else if (isNodeInInferedLineNumber(node, activeLineNumber, instances)) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
      } else if (diagramInstance && diagramInstance.lineNumbers.length > 0) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
        opacity = 0.3;
        color = 'green';
      } else if (
        diagramInstance &&
        diagramInstance.type !== 'Equipment' &&
        diagramInstance.inferedLineNumbers.length > 1
      ) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
        color = 'darkOrange';
      } else if (
        diagramInstance &&
        diagramInstance.inferedLineNumbers.length === 1
      ) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
        opacity = 0.1;
      } else {
        opacity = BACKGROUND_OPACAITY;
      }
      break;
    }
    case 'graphQuery': {
      if (!diagramInstance) {
        opacity = BACKGROUND_OPACAITY;
        break;
      }

      if (
        graphQueryInstances.some(
          (instance) => instance.id === diagramInstance.id
        )
      ) {
        opacity = 1;
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
      } else {
        opacity = BACKGROUND_OPACAITY;
      }

      if (diagramInstance.id === graphQuerySelection) {
        color = 'Teal';
      }
      break;
    }
    case 'connectLabels': {
      if (diagramInstance === undefined) break;

      if (diagramInstance.id === labelSelection) {
        scaleNodeStrokeWidth(node, HIGHLIGHT_SCALE_FACTOR);
      }

      if (diagramInstance.assetId) {
        ({ color, opacity } = COLORS.symbolWithAsset);
      }

      if (isFileConnection(diagramInstance)) {
        if (diagramInstance.linkedDmsFileConnection !== undefined) {
          ({ color, opacity } = COLORS.symbolWithAsset);
          break;
        }

        if (diagramInstance.linkedDmsFileConnectionCandidates !== undefined) {
          color = 'purple';
          break;
        }

        if (diagramInstance.linkedCdfFileId !== undefined) {
          color = 'DarkOrange';
        }
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
    case 'graphQuery':
      if (diagramInstance) {
        node.style.cursor = 'pointer';
      }
      break;
    default:
      assertNever(activeTool, `Unsupported active tool ${activeTool}`);
  }
};

export const scaleStrokeWidth = (scale: number, strokeWidth: string): string =>
  `${scale * parseFloat(strokeWidth)}`;

export const scaleNodeStrokeWidth = (node: SVGElement, scale: number): void => {
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
    scaleNodeStrokeWidth(node, scale);
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

      const startPidInstance = PidInstance.fromDiagramInstance(
        pidDocument,
        startInstance
      );

      const endPidInstance = PidInstance.fromDiagramInstance(
        pidDocument,
        endInstance
      );

      const connectionsLineSegment =
        startPidInstance.getConnectionSegment(endPidInstance)!;

      const svgPath = getSvgPath({
        startPoint: connectionsLineSegment.start,
        endPoint: connectionsLineSegment.stop,
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
            id: `labelConnection-${labelId}-${instance.id}`,
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
