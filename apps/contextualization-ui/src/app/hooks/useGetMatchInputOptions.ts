import {
  useCurrentLinkedView,
  useModelInstancesList,
} from '@fusion/contextualization';

import { MatchData, MatchInputOption } from '../types';

export const useGetMatchInputOptions = () => {
  const linkedView = useCurrentLinkedView();

  const { data: instances } = useModelInstancesList(
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version
  );

  const mappedResult: MatchInputOption[] = instances?.map(
    (matchData: MatchData) => ({
      value: matchData.externalId,
      label: matchData.externalId,
    })
  );

  return mappedResult;
};
