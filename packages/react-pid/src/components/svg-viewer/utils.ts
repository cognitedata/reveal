import {
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
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

/* eslint-disable no-param-reassign */
export const applyStyleToNode = (
  node: SVGElement,
  selection: SVGElement[],
  connectionSelection: DiagramInstanceId | null,
  symbolInstances: DiagramSymbolInstance[],
  lines: DiagramLineInstance[]
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
};
/* eslint-enable no-param-reassign */
