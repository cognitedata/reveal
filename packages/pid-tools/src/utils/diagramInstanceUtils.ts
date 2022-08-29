/* eslint-disable no-restricted-syntax */
import intersection from 'lodash/intersection';

import { EQUIPMENT_TAG_REGEX, UNIT_REGEX } from '../constants';
import {
  DiagramConnection,
  DiagramInstance,
  DiagramInstanceWithPaths,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramEquipmentTag,
  PathReplacement,
  DiagramTag,
} from '../types';

import { isFileConnection, isLineConnection, isEquipment } from './type';

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
): T | undefined {
  return diagramInstances.find((diagramInstance) =>
    diagramInstance.pathIds.includes(pathId)
  );
}

export function getDiagramInstancesByPathIds<
  T extends DiagramInstanceWithPaths
>(diagramInstances: T[], pathIds: string[]): T[] {
  return diagramInstances.filter((instance) =>
    pathIds.some((id) => instance.pathIds.includes(id))
  );
}

export const isDiagramInstanceInList = (
  diagramId: DiagramInstanceId,
  diagramInstances: DiagramInstanceWithPaths[]
) => {
  return diagramInstances.some((instance) => diagramId === instance.id);
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

export const getNoneOverlappingSymbolInstances = (
  symbolInstances: DiagramSymbolInstance[],
  newSymbolInstances: DiagramSymbolInstance[]
) => {
  const instancesToRemove: DiagramInstanceWithPaths[] = [];
  for (const potentialInstance of newSymbolInstances) {
    for (const oldInstance of symbolInstances) {
      const intersectionPathIds = intersection(
        potentialInstance.pathIds,
        oldInstance.pathIds
      );

      if (potentialInstance.pathIds.length === intersectionPathIds.length) {
        instancesToRemove.push(potentialInstance);
      } else if (oldInstance.pathIds.length === intersectionPathIds.length) {
        instancesToRemove.push(oldInstance);
      }
    }
  }

  const instancesToRemoveIds = new Set(
    instancesToRemove.map((inst) => inst.id)
  );

  const instancesToKeep = [...symbolInstances, ...newSymbolInstances].filter(
    (instance) => !instancesToRemoveIds.has(instance.id)
  );

  return { instancesToKeep, instancesToRemove };
};

export const pruneSymbolOverlappingPathsFromLines = (
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const symbolInstancesPathIds = new Set(
    symbolInstances.flatMap((symbol) => symbol.pathIds)
  );

  const linesToKeep: DiagramLineInstance[] = [];
  const linesToDelete: DiagramLineInstance[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const line of lines) {
    const lineIdInSymbolInstance = line.pathIds.some((pathId) =>
      symbolInstancesPathIds.has(pathId)
    );

    if (lineIdInSymbolInstance) {
      linesToDelete.push(line);
    } else {
      linesToKeep.push(line);
    }
  }

  return { linesToKeep, linesToDelete };
};

/* eslint-disable no-param-reassign */
export function addOrRemoveLabelToInstance(
  labelId: string,
  labelText: string,
  instance: DiagramInstanceWithPaths
): void {
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

      const unit = labelText.match(UNIT_REGEX);
      if (unit) {
        [instance.unit] = unit;
      }
    } else if (isEquipment(instance)) {
      if (EQUIPMENT_TAG_REGEX.test(labelText)) {
        instance.equipmentTag = labelText;
      }
    }
    if (isLineConnection(instance)) {
      const character = labelText.match(/'[A-Z]'/);
      if (character) {
        instance.letterIndex = character[0].slice(1, -1);
      }

      const isSameFile = labelText === 'SAME';
      if (isSameFile) {
        instance.pointsToFileName = 'SAME';
      }

      const fileName = labelText.match(EQUIPMENT_TAG_REGEX);
      if (fileName) {
        [instance.pointsToFileName] = fileName;
      }
    }
  }
}
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
export function addOrRemoveLineNumberToInstance<Type extends DiagramInstance>(
  lineNumber: string,
  instance: Type
) {
  if (instance.lineNumbers.includes(lineNumber)) {
    instance.lineNumbers = instance.lineNumbers.filter(
      (ln) => ln !== lineNumber
    );
  } else {
    instance.lineNumbers = [...instance.lineNumbers, lineNumber];
  }
}
/* eslint-enable no-param-reassign */

export const createEquipmentTagInstanceFromSVGTSpanElement = (
  node: SVGTSpanElement
): DiagramTag => {
  return createEquipmentTagInstance(node.innerHTML, node.id);
};

export const createEquipmentTagInstance = (
  equipmentTag: string,
  labelId: string
): DiagramEquipmentTag => {
  return {
    id: `equipTag-${labelId}`,
    equipmentTag,
    labelIds: [labelId],
    type: 'Equipment Tag',
    lineNumbers: [],
    inferedLineNumbers: [],
  };
};

export const getDiagramTagInstanceByTagId = (
  id: string,
  tags: DiagramTag[]
) => {
  return tags.find((tag) => tag.id === id);
};

export const getDiagramTagInstanceByLabelId = (
  labelId: string,
  tags: DiagramTag[]
) => {
  return tags.find((tag) => tag.labelIds.includes(labelId));
};

export const getPathReplacementId = (pathReplacement: PathReplacement[]) =>
  pathReplacement.map((pr) => pr.pathId).join('-');
