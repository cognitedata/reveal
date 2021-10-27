import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import constant from 'lodash/constant';
import flatten from 'lodash/flatten';
import get from 'lodash/get';

import { ITimer } from '@cognite/metrics';
import { Asset } from '@cognite/sdk';

import { UnitConverterItem } from '_helpers/units/interfaces';
import {
  LOG_WELL_DIGITAL_ROCKS,
  LOG_WELL_DIGITAL_ROCKS_NAMESPACE,
  LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE,
} from 'constants/logging';
import {
  TimeLogStages,
  useGetCogniteMetric,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { DIGITAL_ROCKS_ACCESSORS } from 'modules/wellSearch/constants';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { AssetData, DigitalRockSampleData } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';
import {
  normalize,
  normalizeSamples,
} from 'modules/wellSearch/utils/digitalRocks';

import { useSecondarySelectedOrHoveredWells } from '../asset/well';
import { useWellboreAssetIdMap, useWellboreData } from '../asset/wellbore';
import { usePristineIds } from '../common';

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

export const useSelectedWellBoresDigitalRocks = () => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const { digitalRocksPristineIds } = usePristineIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const wells = useSecondarySelectedOrHoveredWells();
  const wellboreData = useWellboreData();
  const [isLoading, setIsLoading] = useState<boolean>();
  const metric = useGetCogniteMetric(LOG_WELL_DIGITAL_ROCKS);
  const userPrefferedUnit = useUserPreferencesMeasurement();
  const [networkTimer, setNetworkTimer] = useState<ITimer>();
  let preperationTimer: ITimer;
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
      setNetworkTimer(
        useStartTimeLogger(
          TimeLogStages.Network,
          metric,
          LOG_WELL_DIGITAL_ROCKS_NAMESPACE
        )
      );
      dispatch(
        wellSearchActions.getWellboreAssets(
          digitalRocksPristineIds,
          wellboreAssetIdMap,
          'digitalRocks',
          config?.digitalRocks?.fetch
        )
      );
      return { isLoading: true, digitalRocks };
    }

    useStopTimeLogger(networkTimer);
    preperationTimer = useStartTimeLogger(
      TimeLogStages.Preperation,
      metric,
      LOG_WELL_DIGITAL_ROCKS_NAMESPACE
    );

    wells.forEach((well) => {
      if (well.wellbores) {
        well.wellbores.forEach((wellbore) => {
          (get(wellboreData[wellbore.id], 'digitalRocks') as AssetData[])
            .map(({ asset }) => asset)
            .map((asset) => {
              const newObj = convertObject(asset)
                .changeUnits(
                  getDigitalRockUnitChangeAccessors(userPrefferedUnit)
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
    useStopTimeLogger(preperationTimer);
    return { isLoading: false, digitalRocks: normalize(digitalRocks) };
  }, [wells, wellboreData, digitalRocksPristineIds, userPrefferedUnit]);
};

// This returns digital rocks samples for given digital rocks list
export const useDigitalRocksSamples = (digitalRocks: Asset[]) => {
  const wellboreData = useWellboreData();
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const [isLoading, setIsLoading] = useState<boolean>();
  const metric = useGetCogniteMetric(LOG_WELL_DIGITAL_ROCKS);
  let networkTimer: ITimer;
  let preperationTimer: ITimer;

  return useMemo(() => {
    const digitalRocksToFetch = digitalRocks.filter(
      (digitalRock) =>
        get(wellboreData, `${digitalRock.parentId}.digitalRocks`, []).filter(
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
      networkTimer = useStartTimeLogger(
        TimeLogStages.Network,
        metric,
        LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE
      );
      dispatch(
        wellSearchActions.getDigitalRockSamples(
          digitalRocksToFetch,
          config?.digitalRocks?.digitalRockSampleFetch
        )
      );
      return { isLoading: true, digitalRockSamples: [] };
    }

    useStopTimeLogger(networkTimer);
    preperationTimer = useStartTimeLogger(
      TimeLogStages.Preperation,
      metric,
      LOG_WELL_DIGITAL_ROCKS_SAMPLES_NAMESPACE
    );

    // Get Digital Rock samples from wellbore data sate filtered by requested digital rocks
    const digitalRockSamples = flatten(
      digitalRocks.reduce(
        (prev, current) => [
          ...prev,
          ...get(wellboreData, `${current.parentId}.digitalRocks`, [])
            .filter((row: AssetData) => row.asset.id === current.id)
            .map((row: AssetData) =>
              (row.digitalRockSamples as DigitalRockSampleData[]).map(
                (digitalRockSampleData) => digitalRockSampleData.asset
              )
            ),
        ],
        [] as Asset[]
      )
    );

    useStopTimeLogger(preperationTimer);
    return {
      isLoading: false,
      digitalRockSamples: normalizeSamples(digitalRockSamples),
    };
  }, [digitalRocks, isLoading, wellboreData]);
};
