/* eslint-disable no-continue */
import { DiagramInstance, DiagramInstanceId } from '../types';
import { Path } from '../graph';

const isEqualDiagramInstance = (
  instance1: DiagramInstance,
  instance2: DiagramInstance
) => {
  if (instance1.assetExternalId !== instance2.assetExternalId) return false;

  return instance1.type === instance2.type;
};

// https://itnext.io/levenshtein-distance-in-typescript-6de81ea2fb63
export const getEditDistance = (
  pathA: DiagramInstance[],
  pathB: DiagramInstance[]
): number => {
  if (pathA.length === 0) return pathB.length;
  if (pathB.length === 0) return pathA.length;

  if (isEqualDiagramInstance(pathA[0], pathB[0]))
    return getEditDistance(pathA.slice(1), pathB.slice(1));

  return (
    1 +
    Math.min(
      getEditDistance(pathA, pathB.slice(1)),
      getEditDistance(pathA.slice(1), pathB),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getEditDistance(pathA.slice(1), pathB.slice(1))
    )
  );
};

const normalizePidPath = (pidPath: DiagramInstance[]): DiagramInstance[] => {
  const normalizedPidPath: DiagramInstance[] = [];
  pidPath.forEach((p) => {
    if (
      normalizedPidPath.length > 0 &&
      normalizedPidPath[normalizedPidPath.length - 1].type === 'Line' &&
      p.type === 'Line'
    )
      return;
    normalizedPidPath.push(p);
  });
  return normalizedPidPath;
};

const normalizeIsoPath = (isoPath: DiagramInstance[]): DiagramInstance[] => {
  const normalizedIsoPath: DiagramInstance[] = [];
  isoPath.forEach((p) => {
    if (
      normalizedIsoPath.length > 0 &&
      normalizedIsoPath[normalizedIsoPath.length - 1].type === 'Line' &&
      (p.type === 'Line' || p.type === 'Custom') // Fix: Add a proper type for ISO symbol that semantically equals a line in a P&ID
    )
      return;
    normalizedIsoPath.push(p);
  });
  return normalizedIsoPath;
};

export type EditDistanceBetweenPaths = {
  assetExternalId: string;
  editDistance: number;
  debugPidPathStr: string;
  debugPidPathStrNormalized: string;
  debugIsoPathStr: string;
  debugIsoPathStrNormalized: string;
};

export const getEditDistanceBetweenPaths = (
  pidPaths: Path[],
  isoPaths: Path[]
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

      const { assetExternalId } = pidPath.path[0];
      if (assetExternalId === undefined) continue;
      if (assetExternalId !== isoPath.path[0].assetExternalId) continue;

      const isoInstanceId = isoPath.to;

      const pidPathNormalized = normalizePidPath(pidPath.path);
      const isoPathNormalized = normalizeIsoPath(isoPath.path);

      const editDistance = getEditDistance(
        pidPathNormalized,
        isoPathNormalized
      );

      if (editDistances.get(pidInstanceId)?.get(isoInstanceId) === undefined) {
        editDistances.get(pidInstanceId)?.set(isoInstanceId, []);
      }

      editDistances
        .get(pidInstanceId)
        ?.get(isoInstanceId)
        ?.push({
          assetExternalId,
          editDistance,
          debugPidPathStr: pidPath.path.map((p) => p.type).join(','),
          debugIsoPathStr: isoPath.path.map((p) => p.type).join(','),
          debugPidPathStrNormalized: pidPathNormalized
            .map((p) => p.type)
            .join(','),
          debugIsoPathStrNormalized: isoPathNormalized
            .map((p) => p.type)
            .join(','),
        });
    }
  }
  return editDistances;
};

export type EditDistanceMapResult = {
  isoInstanceId: DiagramInstanceId;
  editDistances: EditDistanceBetweenPaths[];
};

export const getOptimalEditDistanceMapping = (
  editDistances: Map<string, Map<string, EditDistanceBetweenPaths[]>>
): Map<DiagramInstanceId, EditDistanceMapResult> => {
  type PidIsoEditDistanceMapping = {
    pidInstanceId: DiagramInstanceId;
    isoInstanceId: DiagramInstanceId;
    editDistances: EditDistanceBetweenPaths[];
    sumEditDistances: number;
  };

  const allEditDistancesFromIsoToPid: PidIsoEditDistanceMapping[] = [];
  editDistances.forEach((isoMap, pidInstanceId) => {
    isoMap.forEach((editDistances, isoInstanceId) => {
      let sumEditDistances = 0;
      editDistances.forEach((e) => {
        sumEditDistances += e.editDistance;
      });
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

  const pidIsoEditDistanceMapping: Map<
    DiagramInstanceId,
    EditDistanceMapResult
  > = new Map();

  const usedIds = new Set<string>();
  allEditDistancesFromIsoToPid.forEach((isoPidDistance) => {
    const isoId = `iso-${isoPidDistance.isoInstanceId}`;
    const pidId = `iso-${isoPidDistance.pidInstanceId}`;

    if (!(usedIds.has(isoId) || usedIds.has(pidId))) {
      usedIds.add(isoId);
      usedIds.add(pidId);

      pidIsoEditDistanceMapping.set(isoPidDistance.pidInstanceId, {
        isoInstanceId: isoPidDistance.isoInstanceId,
        editDistances: isoPidDistance.editDistances,
      });
    }
  });

  return pidIsoEditDistanceMapping;
};
