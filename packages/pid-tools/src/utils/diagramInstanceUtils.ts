import { PidDocument } from '../pid/PidDocument';
import {
  DiagramConnection,
  DiagramInstance,
  DiagramInstanceWithPaths,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramEquipmentTagInstance,
} from '../types';

import { isFileConnection } from './type';

export const getDiagramInstanceId = (
  diagramInstance: DiagramInstanceWithPaths
): DiagramInstanceId => {
  return getDiagramInstanceIdFromPathIds(diagramInstance.pathIds);
};

export const getDiagramInstanceIdFromPathIds = (
  pathIds: string[]
): DiagramInstanceId => {
  return pathIds.sort().join('-');
};

export function getDiagramInstanceByPathId<T extends DiagramInstanceWithPaths>(
  diagramInstances: T[],
  pathId: string
): T | null {
  const diagramInstance = diagramInstances.filter((diagramInstance) =>
    diagramInstance.pathIds.includes(pathId)
  );
  if (diagramInstance.length > 0) {
    return diagramInstance[0];
  }
  return null;
}

export const isDiagramInstanceInList = (
  diagramId: DiagramInstanceId,
  diagramInstances: DiagramInstanceWithPaths[]
) => {
  return (
    diagramInstances.find(
      (instance) => diagramId === getDiagramInstanceId(instance)
    ) !== undefined
  );
};

export const getInstanceByDiagramInstanceId = (
  diagramInstances: DiagramInstanceWithPaths[],
  diagramInstanceId: DiagramInstanceId
): DiagramInstanceWithPaths | undefined => {
  return diagramInstances.find(
    (diagramInstance) =>
      getDiagramInstanceId(diagramInstance) === diagramInstanceId
  );
};

export const isPathIdInInstance = (
  pathId: string,
  instanceId: DiagramInstanceId | null
) => {
  return instanceId !== null && instanceId.split('-').includes(pathId);
};

export const isConnectionUnidirectionalMatch = (
  connectionA: DiagramConnection,
  connectionB: DiagramConnection
) =>
  (connectionA.start === connectionB.start &&
    connectionA.end === connectionB.end) ||
  (connectionA.start === connectionB.end &&
    connectionA.end === connectionB.start);

export const connectionExists = (
  connections: DiagramConnection[],
  newConnection: DiagramConnection
) => {
  return connections.some((connection) =>
    isConnectionUnidirectionalMatch(connection, newConnection)
  );
};

export const hasOverlappingPathIds = (
  diagramInstance1: DiagramInstanceWithPaths,
  diagramInstance2: DiagramInstanceWithPaths
) => {
  return diagramInstance1.pathIds.some((e) =>
    diagramInstance2.pathIds.includes(e)
  );
};

export const getLeastComplexDiagramSymbol = (
  pidDocument: PidDocument,
  diagramInstance1: DiagramSymbolInstance,
  diagramInstance2: DiagramSymbolInstance
) => {
  // Most complicated in this sense, is the element with the most pathSegments.
  // Out idea is to use this when labeling circles, and circles with square,
  // to be able to determine that circle with square is the bigger/more complicated object.
  const count1 = pidDocument.getPathSegmentsToPaths(
    diagramInstance1.pathIds
  ).length;

  const count2 = pidDocument.getPathSegmentsToPaths(
    diagramInstance2.pathIds
  ).length;

  return count1 > count2 ? diagramInstance2 : diagramInstance1;
};

export const getNoneOverlappingSymbolInstances = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  newSymbolInstances: DiagramSymbolInstance[]
): DiagramSymbolInstance[] => {
  const objectsToRemove: DiagramInstanceWithPaths[] = [];
  for (let i = 0; i < newSymbolInstances.length; i++) {
    const potentialInstance = newSymbolInstances[i];

    for (let j = 0; j < symbolInstances.length; j++) {
      const oldInstance = symbolInstances[j];

      const pathIdOverlap = hasOverlappingPathIds(
        oldInstance,
        potentialInstance
      );

      // eslint-disable-next-line no-continue
      if (!pathIdOverlap) continue;

      const objectToRemove = getLeastComplexDiagramSymbol(
        pidDocument,
        potentialInstance,
        oldInstance
      );
      objectsToRemove.push(objectToRemove);
    }
  }

  const prunedInstances = [...symbolInstances, ...newSymbolInstances].filter(
    (instance) => objectsToRemove.includes(instance) === false
  );

  return prunedInstances;
};

export const pruneSymbolOverlappingPathsFromLines = (
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const symbolIds = symbolInstances.flatMap((symbol) => symbol.pathIds);

  const prunedLines = [];
  const linesToDelete = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const nonSymbolPaths = line.pathIds.filter(
      (pathId) => symbolIds.includes(pathId) === false
    );

    if (nonSymbolPaths.length) {
      prunedLines.push({ ...line, pathIds: nonSymbolPaths });
    } else {
      linesToDelete.push(line);
    }
  }

  return { prunedLines, linesToDelete };
};

/* eslint-disable no-param-reassign */
export function addOrRemoveLabelToInstance<
  Type extends DiagramInstanceWithPaths
>(labelId: string, labelText: string, instance: Type): void {
  if (instance.labelIds.includes(labelId)) {
    instance.labelIds = instance.labelIds.filter((li) => li !== labelId);
  } else {
    instance.labelIds = [...instance.labelIds, labelId];
    if (isFileConnection(instance)) {
      const labelTextWithoutWhiteSpace = labelText.replace(/\s/g, '');
      const documentNumber = labelTextWithoutWhiteSpace.match(/MF_[0-9]{1,}/g);

      if (documentNumber) {
        instance.documentNumber = parseInt(documentNumber[0].substring(3), 10);
      }

      const toPositionRegex =
        labelTextWithoutWhiteSpace.match(/^[A-Z][0-9]{0,}$/);
      if (toPositionRegex) {
        [instance.toPosition] = toPositionRegex;
      }

      const unit = labelText.match(/G[0-9]{4}/);
      if (unit) {
        [instance.unit] = unit;
      }
    }
  }
}
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
export function addOrRemoveLabelToEquipmentTag(
  label: SVGTSpanElement,
  tag: DiagramEquipmentTagInstance
): void {
  if (tag.labelIds.includes(label.id)) {
    tag.labelIds = tag.labelIds.filter((li) => li !== label.id);
    if (label.innerHTML === tag.name) {
      const { 0: firstDesc, ...rest } = tag.description;
      tag.name = firstDesc;
      tag.description = Object.values(rest);
    } else {
      tag.description = tag.description.filter((li) => li !== label.innerHTML);
    }
  } else {
    tag.labelIds = [...tag.labelIds, label.id];
    if (tag.name) {
      tag.description = [...tag.description, label.innerHTML];
    } else {
      tag.name = label.innerHTML;
    }
  }
}
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
export function addOrRemoveLineNumberToInstance<Type extends DiagramInstance>(
  lineNumber: string,
  instance: Type,
  instances: Type[],
  setter: (arg: Type[]) => void
) {
  if (instance.lineNumbers.includes(lineNumber)) {
    instance.lineNumbers = instance.lineNumbers.filter(
      (ln) => ln !== lineNumber
    );
  } else {
    instance.lineNumbers = [...instance.lineNumbers, lineNumber];
  }
  setter([...instances]);
}
/* eslint-enable no-param-reassign */

export const createEquipmentTagInstance = (
  node: SVGTSpanElement
): DiagramEquipmentTagInstance => {
  return {
    name: node.innerHTML,
    description: [],
    labelIds: [node.id],
    type: 'EquipmentTag',
    lineNumbers: [],
  };
};

export const getDiagramEquipmentTagInstanceByName = (
  name: string,
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  return equipmentTags.find((tag) => tag.name === name);
};

export const getDiagramEquipmentTagInstanceByLabelId = (
  labelId: string,
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  return equipmentTags.find((tag) => tag.labelIds.includes(labelId));
};
