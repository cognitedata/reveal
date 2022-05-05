/* eslint-disable no-param-reassign */

import { DiagramInstance, DiagramTag, Rect, ToolType } from '../types';
import { COLORS } from '../constants';
import {
  DiagramInstanceId,
  DiagramLineInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
  PidDocument,
  DiagramConnection,
  getInstanceByDiagramInstanceId,
  Point,
  getPointsCloserToEachOther,
  getPointTowardOtherPoint,
  connectionExists,
  getDiagramInstanceByPathId,
  DiagramInstanceWithPaths,
  DiagramSymbolInstance,
  getClosestPointsOnSegments,
  getClosestPointOnSegments,
  getEncolosingBoundingBox,
} from '../index';

import isNotUndefined from './isNotUndefined';

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

export const isInLabelSelection = (
  node: SVGElement,
  labelSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, labelSelection);
};

export const isLabelInInstance = (
  instance: DiagramInstance,
  id: DiagramInstanceId
): boolean => {
  return instance.labelIds.includes(id);
};

export const isLabelInInstances = (
  node: SVGElement,
  instances: DiagramInstance[]
) => {
  return instances.some((instance) => isLabelInInstance(instance, node.id));
};

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

  if (diagramInstnace === null) return false;

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

  if (diagramInstnace === null) return false;

  return diagramInstnace.inferedLineNumbers.includes(lineNumber);
};

export const isInGraphSelection = (
  node: SVGElement,
  graphSelection: DiagramInstanceId | null
) => {
  return isPathIdInInstance(node.id, graphSelection);
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

export const isInActiveTag = (
  node: SVGElement,
  activeTagId: string | null,
  tags: DiagramTag[]
) => {
  if (activeTagId === null) return false;

  const activeTag = tags.find((tag) => tag.id === activeTagId);

  if (activeTag === undefined) return false;

  return activeTag.labelIds.includes(node.id);
};

export const isInTags = (node: SVGElement, tags: DiagramTag[]): boolean => {
  const allNodeIds = tags.flatMap((tag) => tag.labelIds);
  return allNodeIds.includes(node.id);
};

export interface ApplyStyleArgs {
  node: SVGElement;
  symbolSelection: string[];
  connectionSelection: DiagramInstanceId | null;
  labelSelection: DiagramInstanceId | null;
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
  connections: DiagramConnection[];
  active: ToolType;
  activeLineNumber: string | null;
  tags: DiagramTag[];
  activeTagId: string | null;
  splitSelection: string | null;
  hideSelection: boolean;
}

export const applyStyleToNode = ({
  node,
  symbolSelection,
  connectionSelection,
  labelSelection,
  symbolInstances,
  lines,
  connections,
  active,
  activeLineNumber,
  tags,
  activeTagId,
  splitSelection,
  hideSelection,
}: ApplyStyleArgs) => {
  let color: string | undefined;
  let opacity: number | undefined;

  if (isDiagramLine(node, lines) || isLabelInInstances(node, lines)) {
    ({ color, opacity } = COLORS.diagramLine);
  }
  if (
    isSymbolInstance(node, symbolInstances) ||
    isLabelInInstances(node, symbolInstances)
  ) {
    ({ color, opacity } = COLORS.symbol);
  }
  if (isInConnectionSelection(node, connectionSelection)) {
    colorNode(node, COLORS.connectionSelection);
    color = COLORS.connectionSelection;
  }
  if (isInLabelSelection(node, labelSelection)) {
    color = COLORS.labelSelection;
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

  if (active === 'setLineNumber') {
    if (node instanceof SVGTSpanElement) {
      if (activeLineNumber && node.innerHTML.includes(activeLineNumber)) {
        node.style.fontWeight = '600';
        return;
      }
    }

    const instances = [...symbolInstances, ...lines];
    const diagramInstnace = getDiagramInstanceByPathId(instances, node.id);
    if (isNodeInLineNumber(node, activeLineNumber, instances)) {
      node.style.strokeWidth = `${2.5 * parseFloat(node.style.strokeWidth)}`;
      color = 'green';
    } else if (isNodeInInferedLineNumber(node, activeLineNumber, instances)) {
      node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
    } else if (diagramInstnace && diagramInstnace.lineNumbers.length > 0) {
      node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
      opacity = 0.3;
      color = 'green';
    } else if (
      diagramInstnace &&
      diagramInstnace.type !== 'Equipment' &&
      diagramInstnace.inferedLineNumbers.length > 1
    ) {
      node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
      color = 'darkOrange';
    } else if (
      diagramInstnace &&
      diagramInstnace.inferedLineNumbers.length === 1
    ) {
      node.style.strokeWidth = `${2 * parseFloat(node.style.strokeWidth)}`;
      opacity = 0.1;
    } else {
      opacity = 0.45;
    }
  }
  colorNode(node, color, opacity);

  if (hideSelection && symbolSelection.some((select) => select === node.id)) {
    node.style.visibility = 'hidden';
  }

  applyPointerCursorStyleToNode({
    node,
    active,
    connectionSelection,
    labelSelection,
    symbolInstances,
    lines,
    connections,
    splitSelection,
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
  splitSelection: string | null;
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
  } else if (active === 'splitLine') {
    if (node instanceof SVGPathElement) {
      if (!isSymbolInstance(node, symbolInstances)) {
        node.style.cursor = 'pointer';
      }
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
  } else if (active === 'setLineNumber') {
    if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines)) {
      node.style.cursor = 'pointer';
    }
  } else if (active === 'addEquipmentTag') {
    if (node instanceof SVGTSpanElement) {
      node.style.cursor = 'pointer';
    }
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

export type ConnectionVisualization = {
  diagramConnection: DiagramConnection;
  node: SVGPathElement;
};

export const visualizeConnections = (
  svg: SVGSVGElement,
  pidDocument: PidDocument,
  connections: DiagramConnection[],
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[]
): ConnectionVisualization[] => {
  const offset = 2;
  const instances = [...symbolInstances, ...lines];
  return connections
    .map((connection) => {
      const startInstance = getInstanceByDiagramInstanceId(
        instances,
        connection.start
      );
      const endInstance = getInstanceByDiagramInstanceId(
        instances,
        connection.end
      );
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

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );

      path.setAttribute(
        'd',
        `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
      );

      path.id = `convis-${connection.start}-${connection.end}`;

      path.setAttribute(
        'style',
        `cursor:pointer;stroke:${COLORS.connection.color};stroke-width:${COLORS.connection.strokeWidth};opacity:${COLORS.connection.opacity};stroke-linecap:round`
      );
      svg.insertBefore(path, svg.children[0]);
      return {
        diagramConnection: connection,
        node: path,
      };
    })
    .filter(isNotUndefined);
};

export interface VisualizeBoundingBoxPros {
  svg: SVGSVGElement;
  boundignBox: Rect;
  id: string;
  color: string;
  opacity: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
}

export const visualizeBoundingBoxBehind = ({
  svg,
  boundignBox,
  id,
  color,
  opacity,
  strokeColor,
  strokeOpacity,
  strokeWidth,
}: VisualizeBoundingBoxPros) => {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  const usedStrokeColor = strokeColor ?? color;
  const usedStrokeOpacity = strokeOpacity ?? opacity;
  const usedStrokeWidth = strokeWidth ?? 0.5;

  rect.setAttribute(
    'style',
    `stroke:${usedStrokeColor};stroke-width:${usedStrokeWidth};fill:${color};stroke-opacity:${usedStrokeOpacity};fill-opacity:${opacity}`
  );

  const { x, y, width, height } = boundignBox;

  rect.setAttribute('x', `${x}`);
  rect.setAttribute('y', `${y}`);
  rect.setAttribute('width', `${width}`);
  rect.setAttribute('height', `${height}`);

  rect.id = id;

  svg.insertBefore(rect, svg.children[0]);

  return rect;
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
  svg: SVGSVGElement,
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

          const labelPoint = pidTspan.getMidPoint();

          const rect = visualizeBoundingBoxBehind({
            svg,
            boundignBox: pidTspan.boundingBox,
            id: `tspanrect_${pidTspan.id}`,
            color: COLORS.connection.color,
            opacity: 0.1,
          });

          const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          );

          path.setAttribute(
            'd',
            `M ${instanceMidPoint.x} ${instanceMidPoint.y} L ${labelPoint.x} ${labelPoint.y}`
          );

          path.id = `labelConnection-${labelId}-${getDiagramInstanceId(
            instance
          )}`;

          path.setAttribute(
            'style',
            `cursor:pointer;stroke:${COLORS.connection.color};stroke-width:${
              COLORS.connection.strokeWidth / 2
            };opacity:${COLORS.connection.opacity};stroke-linecap:round`
          );
          svg.insertBefore(path, svg.nextSibling);

          return {
            labelId,
            textNode: path,
            boundingBoxNode: rect,
          };
        })
        .filter(isNotUndefined),
    };
  });
};

export const visualizeSymbolInstanceBoundingBoxes = (
  svg: SVGSVGElement,
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  padding = 1
): string[] => {
  return symbolInstances.map((symbolInstance) => {
    const bBox = pidDocument.getBoundingBoxToPaths(symbolInstance.pathIds);
    const paddedBoundingBox = {
      x: bBox.x - padding,
      y: bBox.y - padding,
      width: bBox.width + 2 * padding,
      height: bBox.height + 2 * padding,
    };
    const rect = visualizeBoundingBoxBehind({
      svg,
      boundignBox: paddedBoundingBox,
      id: `symbolinstancerect_${symbolInstance.id}`,
      color: COLORS.symbolBoundingBox.color,
      opacity: COLORS.symbolBoundingBox.opacity,
      strokeColor: COLORS.symbolBoundingBox.strokeColor,
      strokeOpacity: COLORS.symbolBoundingBox.strokeOpacity,
      strokeWidth: COLORS.symbolBoundingBox.strokeWidth,
    });
    return rect.id;
  });
};

export const visualizeTagBoundingBoxes = (
  svg: SVGSVGElement,
  pidDocument: PidDocument,
  tags: DiagramTag[],
  padding = 0
): string[] => {
  return tags.map((tag) => {
    const bBox = getEncolosingBoundingBox(
      tag.labelIds.map(
        (labelId) => pidDocument.getPidTspanById(labelId)!.boundingBox
      )
    );
    const paddedBoundingBox = {
      x: bBox.x - padding,
      y: bBox.y - padding,
      width: bBox.width + 2 * padding,
      height: bBox.height + 2 * padding,
    };
    const rect = visualizeBoundingBoxBehind({
      svg,
      boundignBox: paddedBoundingBox,
      id: `tag_${tag.id}`,
      color: COLORS.symbolBoundingBox.color,
      opacity: COLORS.symbolBoundingBox.opacity,
      strokeColor: COLORS.symbolBoundingBox.strokeColor,
      strokeOpacity: COLORS.symbolBoundingBox.strokeOpacity,
      strokeWidth: COLORS.symbolBoundingBox.strokeWidth,
    });
    return rect.id;
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
