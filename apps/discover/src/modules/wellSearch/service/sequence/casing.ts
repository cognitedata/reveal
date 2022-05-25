import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import noop from 'lodash/noop';
import uniqueId from 'lodash/uniqueId';
import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';
import { changeUnitTo } from 'utils/units';

import { Sequence, SequenceColumn } from '@cognite/sdk';
import {
  CasingAssembly,
  CasingItems,
  CasingSchematic,
  DistanceUnitEnum,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells-v3';

import { EMPTY_ARRAY } from 'constants/empty';
import { MetricLogger } from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import {
  CasingAssemblyWithTVD,
  CasingSchematicWithTVDs,
  WellboreId,
  WellboreSourceExternalIdMap,
} from 'modules/wellSearch/types';

import {
  getTrajectoryInterpolateTVDs,
  getTVDForMD,
} from '../../../../domain/wells/trajectory/service/network/trajectoryInterpolate';

import {
  CASINGS_COLUMN_NAME_MAP,
  CASING_SIZE_UNIT,
  SEQUENCE_COLUMNS,
} from './constants';

const CHUNK_LIMIT = 100;

// refactor to use generic log fetcher.
export const getCasingByWellboreIds = async (
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  metricLogger: MetricLogger = [noop, noop]
) => {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;
  startNetworkTimer();

  const casingsData = await fetchCasingsUsingWellsSDK(
    wellboreIds,
    wellboreSourceExternalIdMap
  );

  stopNetworkTimer({
    noOfWellbores: wellboreIds.length,
  });

  return casingsData;
};

export const fetchCasingsUsingWellsSDK = async (
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const idChunkList = chunk(wellboreIds, CHUNK_LIMIT);
  const casings = flatten(
    await Promise.all(
      idChunkList.map((wellboreIdChunk) =>
        getWellSDKClient()
          .casings.list({
            filter: { wellboreIds: wellboreIdChunk.map(toIdentifier) },
            limit: CHUNK_LIMIT,
          })
          .then(async (casingItems: CasingItems) => {
            const casingSchematicsWithTVDs = await getCasingSchematicsWithTVDs(
              casingItems
            );

            return mapCasingsToSequences(
              casingSchematicsWithTVDs,
              wellboreSourceExternalIdMap
            );
          })
      )
    )
  );

  const groupedData = groupBy(casings, 'assetId');

  wellboreIds.forEach((wellboreId) => {
    groupedData[wellboreId] = groupedData[wellboreId] || EMPTY_ARRAY;
  });

  return groupedData;
};

export const getCasingSchematicsWithTVDs = async (
  casingItems: CasingItems
): Promise<CasingSchematicWithTVDs[]> => {
  const tvds = await getTVDValues(casingItems);

  return casingItems.items.map((casingSchematic) => {
    const tvdsForWellbore = head(tvds[casingSchematic.wellboreMatchingId]);
    const tvdUnit = tvdsForWellbore?.trueVerticalDepthUnit.unit;

    if (!tvdsForWellbore) {
      return casingSchematic;
    }

    return {
      ...casingSchematic,
      casingAssemblies: casingSchematic.casingAssemblies.map(
        (casingAssembly) => {
          const tvdTopValue = getTVDForMD(
            tvdsForWellbore,
            casingAssembly.originalMeasuredDepthTop.value
          );
          const tvdBaseValue = getTVDForMD(
            tvdsForWellbore,
            casingAssembly.originalMeasuredDepthBase.value
          );

          return {
            ...casingAssembly,
            trueVerticalDepthTop: tvdTopValue
              ? {
                  value: tvdTopValue,
                  unit: tvdUnit,
                }
              : undefined,
            trueVerticalDepthBase: tvdBaseValue
              ? {
                  value: tvdBaseValue,
                  unit: tvdUnit,
                }
              : undefined,
          };
        }
      ),
    };
  });
};

export const getTVDValues = (casingItems: CasingItems) => {
  const trajectoryInterpolationRequests: TrajectoryInterpolationRequest[] = (
    casingItems.items as CasingSchematic[]
  ).map((casingSchematic) => {
    const measuredDepths = casingSchematic.casingAssemblies.flatMap(
      (casingAssembly) => {
        return [
          casingAssembly.originalMeasuredDepthTop.value,
          casingAssembly.originalMeasuredDepthBase.value,
        ];
      }
    );
    const measuredDepthUnit = {
      unit:
        head(casingSchematic.casingAssemblies)?.originalMeasuredDepthTop.unit ||
        DistanceUnitEnum.Meter,
    };

    return {
      wellboreId: toIdentifier(casingSchematic.wellboreMatchingId),
      measuredDepths,
      measuredDepthUnit,
    };
  });

  return getTrajectoryInterpolateTVDs(
    casingItems.items,
    trajectoryInterpolationRequests
  );
};

export const mapCasingsToSequences = (
  casingSchematicsWithTVDs: CasingSchematicWithTVDs[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  return casingSchematicsWithTVDs.reduce((goodSequences, casingSchematic) => {
    // drop empty casingAssemblies sequences
    if (isEmpty(casingSchematic.casingAssemblies)) {
      // console.log('Dropping schematic for:', casingSchematic);
      return goodSequences;
    }

    const sequenceOfWellbore = casingSchematic.casingAssemblies.map(
      (casingAssembly) => {
        return {
          id: Number(uniqueId()),
          columns: getCasingsColumns(casingAssembly),
          assetId:
            wellboreSourceExternalIdMap[
              casingSchematic.wellboreAssetExternalId
            ],
          name: casingSchematic.source.sourceName,
          externalId: casingSchematic.wellboreAssetExternalId,
          metadata: getSequenceMetadata(casingAssembly),
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
        } as Sequence;
      }
    );

    return [...goodSequences, ...sequenceOfWellbore];
  }, [] as Sequence[]);
};

export const getCasingsColumns = (casingAssembly: CasingAssembly) => {
  const groupedColumns = keyBy(SEQUENCE_COLUMNS, 'name');

  return Object.keys(CASINGS_COLUMN_NAME_MAP).map((columnName) => {
    const casingAssemblyKey = get(
      CASINGS_COLUMN_NAME_MAP,
      columnName
    ) as keyof CasingAssembly;

    const casingAssemblyData = casingAssembly[casingAssemblyKey];
    const sequenceColumnData = get(groupedColumns, columnName);

    return {
      ...sequenceColumnData,
      metadata: {
        unit:
          sequenceColumnData.metadata?.unit || get(casingAssemblyData, 'unit'),
      },
    } as SequenceColumn;
  });
};

export const getSequenceMetadata = (casingAssembly: CasingAssemblyWithTVD) => {
  const minOutsideDiameter = changeUnitTo(
    casingAssembly.minOutsideDiameter.value,
    casingAssembly.minOutsideDiameter.unit,
    CASING_SIZE_UNIT
  );

  const minInsideDiameter = changeUnitTo(
    casingAssembly.minInsideDiameter.value,
    casingAssembly.minInsideDiameter.unit,
    CASING_SIZE_UNIT
  );

  const {
    originalMeasuredDepthTop,
    originalMeasuredDepthBase,
    trueVerticalDepthTop,
    trueVerticalDepthBase,
    type,
  } = casingAssembly;

  return {
    assy_original_md_base: String(originalMeasuredDepthBase.value),
    assy_original_md_base_unit: originalMeasuredDepthBase.unit,
    assy_name: type,
    assy_original_md_top: String(originalMeasuredDepthTop.value),
    assy_original_md_top_unit: originalMeasuredDepthTop.unit,
    assy_size: String(minOutsideDiameter || '-'),
    assy_min_inside_diameter: String(minInsideDiameter || '-'),
    assy_tvd_top: trueVerticalDepthTop
      ? String(trueVerticalDepthTop.value)
      : undefined,
    assy_tvd_top_unit: trueVerticalDepthTop?.unit,
    assy_tvd_base: trueVerticalDepthBase
      ? String(trueVerticalDepthBase.value)
      : undefined,
    assy_tvd_base_unit: trueVerticalDepthBase?.unit,
  };
};
