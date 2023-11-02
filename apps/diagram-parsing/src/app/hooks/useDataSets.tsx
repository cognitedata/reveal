import { useQuery } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { Body, toast } from '@cognite/cogs.js';

import { getCogniteSDKClient } from '../../cogniteSdk';

import { useTranslation } from './useTranslation';

export const useDataSets = () => {
  const { t } = useTranslation();

  const sdk = getCogniteSDKClient();
  const project = getProject();

  const { data, ...rest } = useQuery({
    onError: (error) => {
      toast.error(
        <>
          <Body size="medium">{t('datasets-error-load')}</Body>
          <Body size="small">{error?.toString()}</Body>
        </>
      );
    },
    queryKey: [project, 'dataSets'],
    queryFn: () => sdk.datasets.list(),
  });

  return { data: data?.items || [], ...rest };
};
