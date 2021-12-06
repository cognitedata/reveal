import {
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
} from '@cognite/pid-tools';

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
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[],
  graphPaths: DiagramInstanceId[][],
  graphSelection: DiagramInstanceId | null
) => {
  if (isDiagramLine(node, lines)) {
    node.style.stroke = COLORS.diagramLine;
  }
  if (isSymbolInstance(node, symbolInstances)) {
    node.style.stroke = COLORS.symbol;
  }
  if (isInConnectionSelection(node, connectionSelection)) {
    node.style.stroke = COLORS.connectionSelection;
  }
  if (isInAddSymbolSelection(node, selection)) {
    node.style.stroke = COLORS.symbolSelection;
  }
  if (isInGraphSelection(node, graphSelection)) {
    node.style.stroke = COLORS.connectionSelection;
  }
};
/* eslint-enable no-param-reassign */

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
