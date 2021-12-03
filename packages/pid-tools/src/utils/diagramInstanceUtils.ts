import { SvgDocument } from '../matcher';
import {
  DiagramConnection,
  DiagramInstanceId,
  DiagramSymbolInstance,
} from '../types';

export const getDiagramInstanceId = (
  symbolInstance: DiagramSymbolInstance
): DiagramInstanceId => {
  return symbolInstance.pathIds.sort().join('-');
};

export const getSymbolInstanceByPathId = (
  symbolInstances: DiagramSymbolInstance[],
  pathId: string
): DiagramSymbolInstance | null => {
  const symbolInstance = symbolInstances.filter((symbolInstance) =>
    symbolInstance.pathIds.includes(pathId)
  );
  if (symbolInstance.length > 0) {
    return symbolInstance[0];
  }
  return null;
};

export const isPathIdInInstance = (
  pathId: string,
  instanceId: DiagramInstanceId | null
) => {
  return instanceId !== null && instanceId.split('-').includes(pathId);
};

export const connectionExists = (
  connections: DiagramConnection[],
  newConnection: DiagramConnection
) => {
  return connections.some(
    (connection) =>
      (connection.start === newConnection.start &&
        connection.end === newConnection.end) ||
      (connection.start === newConnection.end &&
        connection.end === newConnection.start)
  );
};

export const hasOverlappingPathIds = (
  diagramSymbolInstance1: DiagramSymbolInstance,
  DiagramSymbolInstance2: DiagramSymbolInstance
) => {
  return diagramSymbolInstance1.pathIds.some((e) =>
    DiagramSymbolInstance2.pathIds.includes(e)
  );
};

const getPathSegmentLengthInSymbolInstance = (
  svgDocument: SvgDocument,
  diagramSymbolInstance1: DiagramSymbolInstance
) => {
  let count = 0;
  for (let i = 0; i < diagramSymbolInstance1.pathIds.length; i++) {
    const pathId = diagramSymbolInstance1.pathIds[i];
    const segmentList = svgDocument.getInternalPathById(pathId)?.segmentList;
    if (segmentList !== undefined) {
      count += segmentList.length;
    }
  }
  return count;
};

export const getLeastComplexDiagramSymbol = (
  svgDocument: SvgDocument,
  diagramSymbolInstance1: DiagramSymbolInstance,
  diagramSymbolInstance2: DiagramSymbolInstance
) => {
  // Most complicated in this sense, is the element with the most pathSegments.
  // Out idea is to use this when labeling circles, and circles with square,
  // to be able to determine that circle with square is the bigger/more complicated object.

  const count1 = getPathSegmentLengthInSymbolInstance(
    svgDocument,
    diagramSymbolInstance1
  );

  const count2 = getPathSegmentLengthInSymbolInstance(
    svgDocument,
    diagramSymbolInstance2
  );

  return count1 > count2 ? diagramSymbolInstance2 : diagramSymbolInstance1;
};

export const getNoneOverlappingSymbolInstances = (
  svgDocument: SvgDocument,
  symbolInstances: DiagramSymbolInstance[],
  newSymbolInstances: DiagramSymbolInstance[]
) => {
  const objectsToRemove: DiagramSymbolInstance[] = [];
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
        svgDocument,
        potentialInstance,
        oldInstance
      );
      objectsToRemove.push(objectToRemove);
    }
  }

  const prunedInstances: DiagramSymbolInstance[] = [
    ...symbolInstances,
    ...newSymbolInstances,
  ].filter((instance) => objectsToRemove.includes(instance) === false);

  return prunedInstances;
};
