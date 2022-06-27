import { LabelDefinition } from '@cognite/sdk';
import { useQuery } from 'react-query';

import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

export const useLabels = () => {
  return useQuery<LabelDefinition[]>(['labels'], () => {
    return getCogniteSDKClient()
      .labels.list()
      .then((response) => {
        return response.items;
      });
  });
};

export const useFindLabelByExternalId = (externalId?: string) => {
  if (externalId === undefined) return undefined;

  const { data } = useLabels();

  const label = data?.find((item) => item.externalId === externalId);

  return label?.name;
};
