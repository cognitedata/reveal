import { useWellInspectSelectedWells } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWells';
import { useWellInspectWellboreExternalAssetIdMap } from 'domain/wells/well/internal/hooks/useWellInspectWellboreExternalAssetIdMap';

import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import constant from 'lodash/constant';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { UnitConverterItem } from 'utils/units';

import { Asset } from '@cognite/sdk';

import {
  LOG_WELL_DIGITAL_ROCKS,
  LOG_WELL_DIGITAL_ROCKS_NAMESPACE,
  LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE,
} from 'constants/logging';
import { TimeLogStages, useMetricLogger } from 'hooks/useTimeLog';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { DIGITAL_ROCKS_ACCESSORS } from 'modules/wellSearch/constants';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { AssetData } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';
import { getWellboreExternalAssetIdReverseMap } from 'modules/wellSearch/utils/common';
import {
  normalize,
  normalizeSamples,
} from 'modules/wellSearch/utils/digitalRocks';

import { usePristineIds } from './common';
import { useWellboreData } from './wellbore';

const getDigitalRockUnitChangeAccessors = (
  toUnit: string
): UnitConverterItem[] => [
  {
    id: 'id',
    accessor: DIGITAL_ROCKS_ACCESSORS.PLUG_DEPTH,
    fromAccessor: DIGITAL_ROCKS_ACCESSORS.DEPTH_UNIT,
    to: toUnit,
  },
];

export const digitalRockAccessorsToFixedDecimal = [
  DIGITAL_ROCKS_ACCESSORS.PLUG_DEPTH,
];

const getDigitalRocksFetchFunction = (
  metadata: Record<string, unknown> | undefined
) => {
  if (metadata) {
    return (extraPayload: Record<string, unknown>) => {
      return getCogniteSDKClient().assets.search({
        ...metadata,
        filter: merge(metadata.filter, extraPayload),
      });
    };
  }
  return undefined;
};

const getDigitalRocksSampleFetchFunction = () => {
  return (extraPayload: Record<string, unknown>) => {
    return getCogniteSDKClient().assets.search({
      filter: extraPayload,
    });
  };
};

export const useSelectedWellBoresDigitalRocks = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { digitalRocksPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellInspectWellboreExternalAssetIdMap();
  const wells = useWellInspectSelectedWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [startNetworkTimer, stopNetworkTimer] = useMetricLogger(
    LOG_WELL_DIGITAL_ROCKS,
    TimeLogStages.Network,
    LOG_WELL_DIGITAL_ROCKS_NAMESPACE
  );
  const [startPreparationTimer, stopPreparationTimer] = useMetricLogger(
    LOG_WELL_DIGITAL_ROCKS,
    TimeLogStages.Preperation,
    LOG_WELL_DIGITAL_ROCKS_NAMESPACE
  );
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  return useMemo(() => {
    const digitalRocks: Asset[] = [];

    if (isLoading && !digitalRocksPristineIds.length) {
      setIsLoading(false);
    }

    if (digitalRocksPristineIds.length && isLoading) {
      return { isLoading: true, digitalRocks };
    }

    if (digitalRocksPristineIds.length && !isLoading) {
      setIsLoading(true);
      startNetworkTimer();

      dispatch<any>(
        wellSearchActions.getWellboreAssetsByExternalParentIds(
          digitalRocksPristineIds,
          wellboreAssetIdMap,
          'digitalRocks',
          getDigitalRocksFetchFunction(config?.digitalRocks?.metadata)
        )
      );
      return { isLoading: true, digitalRocks };
    }

    stopNetworkTimer();
    startPreparationTimer();

    wells.forEach((well) => {
      if (well.wellbores && userPreferredUnit) {
        well.wellbores.forEach((wellbore) => {
          (get(wellboreData[wellbore.id], 'digitalRocks') as AssetData[])
            .map(({ asset }) => asset)
            .map((asset) => {
              const newObj = convertObject(asset)
                .changeUnits(
                  getDigitalRockUnitChangeAccessors(userPreferredUnit)
                )
                .toFixedDecimals(digitalRockAccessorsToFixedDecimal)
                .get();
              return newObj;
            })
            .forEach((asset) => {
              digitalRocks.push(asset);
            });
        });
      }
    });
    stopPreparationTimer();
    return { isLoading: false, digitalRocks: normalize(digitalRocks) };
  }, [wells, wellboreData, digitalRocksPristineIds, userPreferredUnit]);
};

// This returns digital rocks samples for given digital rocks list
export const useDigitalRocksSamples = (digitalRocks: Asset[]) => {
  const wellboreData = useWellboreData();
  const dispatch = useDispatch();

  const wellboreAssetIdMap = useWellInspectWellboreExternalAssetIdMap();
  const wellboreAssetIdReverseMap =
    getWellboreExternalAssetIdReverseMap(wellboreAssetIdMap);

  const [isLoading, setIsLoading] = useState<boolean>();
  const [startNetworkTimer, stopNetworkTimer] = useMetricLogger(
    LOG_WELL_DIGITAL_ROCKS,
    TimeLogStages.Network,
    LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE
  );
  const [startPreparationTimer, stopPreparationTimer] = useMetricLogger(
    LOG_WELL_DIGITAL_ROCKS,
    TimeLogStages.Preperation,
    LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE
  );

  return useMemo(() => {
    const digitalRocksToFetch = digitalRocks.filter(
      (digitalRock) =>
        get(
          wellboreData,
          `${
            wellboreAssetIdReverseMap[digitalRock.parentExternalId || '']
          }.digitalRocks`,
          []
        )
          // TODO(PP-2544): This whole hooks is fishy. Needs to be refactored and data extracted to react-query
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .filter(
            (row: AssetData) =>
              row.asset.id === digitalRock.id && !row.digitalRockSamples
          ).length
    );

    if (isLoading && !digitalRocksToFetch.length) {
      setIsLoading(false);
    }

    if (digitalRocksToFetch.length && isLoading) {
      return { isLoading: true, digitalRockSamples: [] };
    }

    if (digitalRocksToFetch.length && !isLoading) {
      setIsLoading(constant(true));
      startNetworkTimer();
      dispatch<any>(
        wellSearchActions.getDigitalRockSamples(
          digitalRocksToFetch,
          wellboreAssetIdReverseMap,
          getDigitalRocksSampleFetchFunction()
        )
      );
      return { isLoading: true, digitalRockSamples: [] };
    }

    stopNetworkTimer();
    startPreparationTimer();

    // Get Digital Rock samples from wellbore data sate filtered by requested digital rocks
    const digitalRockSamples = flatten(
      digitalRocks.reduce((prev, current) => {
        const digitalRocks =
          wellboreData[wellboreAssetIdReverseMap[current.parentExternalId || 0]]
            ?.digitalRocks;

        const asset = digitalRocks?.find(
          (digiRock) => digiRock.asset.id === current.id
        );

        if (asset?.digitalRockSamples) {
          return [
            ...prev,
            ...(asset
              ? asset.digitalRockSamples.map((sample) => sample.asset)
              : []),
          ];
        }

        return prev;
      }, [] as Asset[])
    );

    stopPreparationTimer();
    return {
      isLoading: false,
      digitalRockSamples: normalizeSamples(digitalRockSamples),
    };
  }, [digitalRocks, isLoading, wellboreData]);
};
