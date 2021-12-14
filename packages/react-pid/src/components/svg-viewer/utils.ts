import {
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  isPathIdInInstance,
  DiagramLabel,
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
  return (
    instance.labels?.findIndex(
      (labelOnInstance) => labelOnInstance.id === id
    ) || -1
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
  graphSelection: DiagramInstanceId | null
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
  if (node instanceof SVGTSpanElement) {
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
