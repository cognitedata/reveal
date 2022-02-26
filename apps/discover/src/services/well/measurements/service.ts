import chunk from 'lodash/chunk';

import {
  DepthMeasurement,
  DepthMeasurementItems,
  DepthMeasurementData,
} from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import { WdlMeasurementType } from 'modules/wellSearch/types';

const CHUNK_LIMIT = 100;

export const getDepthMeasurements = (
  wellboreMatchingIds: string[],
  measurementTypes: WdlMeasurementType[]
): Promise<DepthMeasurement[]>[] => {
  const idChunkList = chunk(wellboreMatchingIds, CHUNK_LIMIT);
  const depthMeasurementPromises: Promise<DepthMeasurement[]>[] = [];
  idChunkList.forEach((idChunk) => {
    depthMeasurementPromises.push(
      getWellSDKClient()
        .measurements.list({
          filter: {
            measurementTypes,
            wellboreIds: idChunk.map(toIdentifier),
          },
          limit: CHUNK_LIMIT,
        })
        .then(
          (depthMeasurementItem: DepthMeasurementItems) =>
            depthMeasurementItem.items
        )
    );
  });
  return depthMeasurementPromises;
};

export const getDepthMeasurementData = (
  sequenceExternalId: string
): Promise<DepthMeasurementData> => {
  return getWellSDKClient().measurements.listData({
    sequenceExternalId,
  });
};
