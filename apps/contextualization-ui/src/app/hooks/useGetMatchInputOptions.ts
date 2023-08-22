import {
  getUrlParameters,
  useModelInstancesList,
} from '@fusion/contextualization';

import { MatchData, MatchInputOptions } from '../types';

export const useGetMatchInputOptions = () => {
  const { space, versionNumber, dataModelType } = getUrlParameters();
  const { data: instances } = useModelInstancesList(
    space,
    dataModelType,
    versionNumber
  );

  const mappedResult: MatchInputOptions[] = instances?.map(
    (matchData: MatchData) => ({
      value: matchData.externalId,
      label: matchData.externalId,
    })
  );

  return mappedResult;
};
