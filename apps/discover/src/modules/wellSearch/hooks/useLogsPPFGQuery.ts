/*
 * this file is only being used in LogTypeViewer in v2, which will be removed in near future
 * Hence, not adding test for this.
 * */
import { useQuery } from 'react-query';

import { Sequence } from '@cognite/sdk';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';

import {
  getSequencesByAssetIds as service,
  getSequenceRowData as rowService,
} from '../service';
import { SequenceRow } from '../types';

import { useWellConfig } from './useWellConfig';

export const useLogsPPFGQuery = (wellboreId: number | undefined) => {
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const filter = config?.ppfg?.metadata?.filter;
  return useQuery(
    [WELL_QUERY_KEY.LOGS_PPFGS, wellboreId],
    () =>
      service([wellboreAssetIdMap[wellboreId as number]], filter).then(
        async (responses: Sequence[]) => {
          if (responses.length) {
            const rows = await rowService(responses[0].id);
            return {
              sequence: { ...responses[0], assetId: wellboreId },
              rows: rows as SequenceRow[],
            };
          }
          return undefined;
        }
      ),
    { enabled: !!wellboreId }
  );
};
