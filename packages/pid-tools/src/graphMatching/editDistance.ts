/* eslint-disable no-continue */
import { DiagramInstanceId, DiagramInstanceOutputFormat } from '../types';
import { PathOutputFormat } from '../graph';
import { isCrossConnection } from '../graphMatching';

import { CrossDocumentConnection } from './graphMatching';

const isEqualDiagramInstance = (
  instance1: DiagramInstanceOutputFormat,
  instance2: DiagramInstanceOutputFormat
) => {
  if (instance1.type === 'Instrument')
    return isCrossConnection(instance1, instance2);

  return instance1.type === instance2.type;
};

// https://itnext.io/levenshtein-distance-in-typescript-6de81ea2fb63
export const getEditDistance = (
  pathA: DiagramInstanceOutputFormat[],
  pathB: DiagramInstanceOutputFormat[]
): number => {
  if (pathA.length === 0 || pathB.length === 0)
    return Math.max(pathA.length, pathB.length);

  const pathALength = pathA.length + 1;
  const pathBLength = pathB.length + 1;

  const matrix = Array.from({ length: pathALength }).map(() =>
    Array.from({ length: pathBLength }).map(() => 0)
  );

  for (let i = 0; i < pathALength; i++) matrix[i][0] = i;

  for (let i = 0; i < pathBLength; i++) matrix[0][i] = i;

  for (let j = 1; j < pathB.length; j++)
    for (let i = 1; i < pathA.length; i++)
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] +
          (isEqualDiagramInstance(pathA[i], pathB[j]) ? 0 : 1)
      );

  return matrix[pathA.length - 1][pathB.length - 1];
};

export type EditDistanceBetweenPaths = {
  startObject: CrossDocumentConnection;
  editDistance: number;
  pidPath: DiagramInstanceOutputFormat[];
  isoPath: DiagramInstanceOutputFormat[];
  debugPidPathStr: string;
  debugIsoPathStr: string;
};

export const getEditDistanceBetweenPaths = (
  pidPaths: PathOutputFormat[],
  isoPaths: PathOutputFormat[]
): Map<string, Map<string, EditDistanceBetweenPaths[]>> => {
  const editDistances = new Map<
    string,
    Map<string, EditDistanceBetweenPaths[]>
  >();

  for (let p1 = 0; p1 < pidPaths.length; p1++) {
    const pidPath = pidPaths[p1];
    const pidInstanceId = pidPath.to;

    if (editDistances.get(pidInstanceId) === undefined) {
      editDistances.set(pidInstanceId, new Map());
    }

    for (let p2 = 0; p2 < isoPaths.length; p2++) {
      const isoPath = isoPaths[p2];

      if (!isCrossConnection(pidPath.path[0], isoPath.path[0])) continue;
      const isoInstanceId = isoPath.to;

      const editDistance = getEditDistance(pidPath.path, isoPath.path);

      if (editDistances.get(pidInstanceId)?.get(isoInstanceId) === undefined) {
        editDistances.get(pidInstanceId)?.set(isoInstanceId, []);
      }

      editDistances
        .get(pidInstanceId)
        ?.get(isoInstanceId)
        ?.push({
          startObject: {
            pidInstanceId: pidPath.path[0].id,
            isoInstanceId: isoPath.path[0].id,
          },
          editDistance,
          debugPidPathStr: pidPath.path.map((p) => p.type).join(','),
          debugIsoPathStr: isoPath.path.map((p) => p.type).join(','),
          pidPath: pidPath.path,
          isoPath: isoPath.path,
        });
    }
  }
  return editDistances;
};

export type EditDistanceMapResult = {
  isoInstanceId: DiagramInstanceId;
  editDistances: EditDistanceBetweenPaths[];
};

export type SymbolMapping = Map<DiagramInstanceId, EditDistanceMapResult>;

export const getOptimalEditDistanceMapping = (
  editDistances: Map<string, Map<string, EditDistanceBetweenPaths[]>>
): SymbolMapping => {
  type PidIsoEditDistanceMapping = {
    pidInstanceId: DiagramInstanceId;
    isoInstanceId: DiagramInstanceId;
    editDistances: EditDistanceBetweenPaths[];
    sumEditDistances: number;
  };

  const allEditDistancesFromIsoToPid: PidIsoEditDistanceMapping[] = [];
  editDistances.forEach((isoMap, pidInstanceId) => {
    isoMap.forEach((editDistances, isoInstanceId) => {
      // Only check if iso and pid type is equal
      if (
        editDistances.some(
          (ed) =>
            ed.pidPath[ed.pidPath.length - 1].type !==
            ed.isoPath[ed.isoPath.length - 1].type
        )
      )
        return;

      let sumEditDistances = 0;
      editDistances.forEach((ed) => {
        sumEditDistances += ed.editDistance;
      });

      sumEditDistances /= editDistances.length;

      allEditDistancesFromIsoToPid.push({
        sumEditDistances,
        editDistances,
        pidInstanceId,
        isoInstanceId,
      });
    });
  });

  allEditDistancesFromIsoToPid.sort(
    (a, b) => a.sumEditDistances - b.sumEditDistances
  );

  const pidIsoEditDistanceMapping: SymbolMapping = new Map();

  const usedIds = new Set<string>();
  allEditDistancesFromIsoToPid.forEach((isoPidDistance) => {
    const isoId = isoPidDistance.isoInstanceId;
    const pidId = isoPidDistance.pidInstanceId;

    if (usedIds.has(isoId) || usedIds.has(pidId)) return;

    if (isoPidDistance.sumEditDistances > 1.4) return;

    usedIds.add(isoId);
    usedIds.add(pidId);

    pidIsoEditDistanceMapping.set(isoPidDistance.pidInstanceId, {
      isoInstanceId: isoPidDistance.isoInstanceId,
      editDistances: isoPidDistance.editDistances,
    });
  });

  return pidIsoEditDistanceMapping;
};
