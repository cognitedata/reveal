import {
  useCurrentView,
  useModelInstancesList,
} from '@fusion/contextualization';

import { MatchData, MatchInputOptions } from '../types';

export const useGetMatchInputOptions = () => {
  const view = useCurrentView();

  const { data: instances } = useModelInstancesList(
    view?.space,
    view?.externalId,
    view?.version
  );

  const mappedResult: MatchInputOptions[] = instances?.map(
    (matchData: MatchData) => ({
      value: matchData.externalId,
      label: matchData.externalId,
    })
  );

  return mappedResult;
};
