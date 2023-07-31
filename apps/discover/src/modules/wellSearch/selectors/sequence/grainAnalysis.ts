import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import merge from 'lodash/merge';

import { Asset } from '@cognite/sdk';

import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  AssetData,
  DigitalRockSampleData,
  SequenceData,
} from 'modules/wellSearch/types';

import { getCogniteSDKClient } from '../../../../utils/getCogniteSDKClient';
import { useWellboreData } from '../wellbore';

const getDigitalRocksGrainPartitioningFetchFunction = (
  metadata: Record<string, unknown> | undefined
) => {
  if (metadata) {
    return (extraPayload: Record<string, unknown>) => {
      return getCogniteSDKClient().sequences.search({
        ...metadata,
        filter: merge(metadata.filter, extraPayload),
      });
    };
  }
  return undefined;
};

export const useGrainPartionings = (digitalRockSample: Asset) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const wellboreData = useWellboreData();
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  return useMemo(() => {
    const wbId = get(digitalRockSample, 'metadata.wellboreId');
    let grainPartionings: SequenceData[] | undefined;
    (wellboreData[wbId]?.digitalRocks || ([] as AssetData[])).forEach(
      (digitalRock) => {
        if (digitalRock.asset.id === digitalRockSample.parentId) {
          (digitalRock.digitalRockSamples as DigitalRockSampleData[]).forEach(
            (digitalRockSampleRow) => {
              if (
                digitalRockSampleRow.asset.id === digitalRockSample.id &&
                digitalRockSampleRow.gpart
              ) {
                grainPartionings = digitalRockSampleRow.gpart;
              }
            }
          );
        }
      }
    );

    if (isLoading && grainPartionings) {
      setIsLoading(false);
    }

    if (!grainPartionings) {
      if (!isLoading) {
        setIsLoading(true);
        dispatch<any>(
          wellSearchActions.getGrainAnalysisData(
            digitalRockSample,
            'gpart',
            getDigitalRocksGrainPartitioningFetchFunction(
              config?.digitalRocks?.gpartFetchMetadata
            )
          )
        );
      }
      return { isLoading: true, grainPartionings };
    }
    return { isLoading: false, grainPartionings };
  }, [wellboreData, config, digitalRockSample]);
};
