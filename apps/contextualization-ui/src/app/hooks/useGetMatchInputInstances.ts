import {
  useCurrentLinkedView,
  useRetrieveInstances,
} from '@fusion/contextualization';

import { ManualMatch } from '../types';
import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useGetMatchInputInstances = (manualMatches: {
  [key: string]: ManualMatch;
}) => {
  const linkedView = useCurrentLinkedView();

  const items = manualMatches
    ? Object.values(manualMatches).reduce(
        (result: { space: string; externalId: string }[], match) => {
          if (
            match.matchedInstance !== undefined &&
            match.matchedInstance.value !== undefined
          ) {
            result.push({
              externalId: match.matchedInstance.value,
              space: linkedView?.space,
            });
          }
          return result;
        },
        []
      )
    : [];

  const { data: instances } = useRetrieveInstances(
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version,
    items
  );

  const matchInputInstances = convertToInternalModelInstance(
    instances,
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version
  );

  return matchInputInstances;
};
