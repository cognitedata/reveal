import { CrossDocumentConnection } from '../graphMatching';

interface IdField {
  id: string;
}

function getCrossConnections<T extends IdField>(
  pidInstances: T[],
  isoInstances: T[],
  isMatch: (pidInstance: T, isoInstance: T) => boolean,
  maxCrossConnectionDegreePerInstance = 3
): CrossDocumentConnection[] {
  const pidToIsoMatches = new Map<string, Set<string>>();
  const numMatchesPerIsoInstance = new Map<string, number>();

  const addPidIsoMatch = (pidInstance: T, isoInstance: T) => {
    const pidMatchSet = pidToIsoMatches.get(pidInstance.id);
    if (pidMatchSet === undefined) {
      const newIsoMatchSet = new Set<string>();
      newIsoMatchSet.add(isoInstance.id);
      pidToIsoMatches.set(pidInstance.id, newIsoMatchSet);
    } else {
      pidMatchSet.add(isoInstance.id);
    }

    const numIsoMatch = numMatchesPerIsoInstance.get(isoInstance.id) ?? 0;
    numMatchesPerIsoInstance.set(isoInstance.id, numIsoMatch + 1);
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const pidInstance of pidInstances) {
    const matchedIsoInstances = isoInstances.filter((isoInstrument) =>
      isMatch(pidInstance, isoInstrument)
    );

    matchedIsoInstances.forEach((isoInstance) =>
      addPidIsoMatch(pidInstance, isoInstance)
    );
  }

  const crossDocumentConnections: CrossDocumentConnection[] = [];
  pidToIsoMatches.forEach((isoIdSet, pidId) => {
    if (isoIdSet.size > maxCrossConnectionDegreePerInstance) return;

    isoIdSet.forEach((isoId) => {
      const numMatchesForIsoInstance = numMatchesPerIsoInstance.get(isoId);
      if (
        !numMatchesForIsoInstance ||
        numMatchesForIsoInstance > maxCrossConnectionDegreePerInstance
      )
        return;

      crossDocumentConnections.push({
        pidInstanceId: pidId,
        isoInstanceId: isoId,
      });
    });
  });

  return crossDocumentConnections;
}

export default getCrossConnections;
