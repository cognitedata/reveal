import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import { CogniteClient } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';

import {
  IndustryCanvasContainerConfig,
  TimeseriesContainerReference,
} from '../../types';
import {
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from '../../utils/dimensions';

const resolveTimeseriesContainerConfig = async (
  sdk: CogniteClient,
  {
    id,
    resourceId,
    startDate,
    endDate,
    x,
    y,
    width,
    height,
    label,
  }: TimeseriesContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  const timeseries = await sdk.timeseries.retrieve([{ id: resourceId }]);

  if (timeseries.length !== 1) {
    throw new Error('Expected to find exactly one timeseries');
  }

  const name = timeseries[0].name;
  const timeseriesExternalId = timeseries[0].externalId;

  return {
    id: id || uuid(),
    type: ContainerType.TIMESERIES,
    label: label ?? name ?? timeseriesExternalId,
    startDate:
      startDate !== undefined
        ? startDate
        : dayjs(new Date()).subtract(2, 'years').startOf('day').toISOString(),
    endDate:
      endDate !== undefined
        ? endDate
        : dayjs(new Date()).endOf('day').toDate().toISOString(),
    x: x,
    y: y,
    width: width ?? DEFAULT_TIMESERIES_WIDTH,
    height: height ?? DEFAULT_TIMESERIES_HEIGHT,
    timeseriesId: resourceId,
    metadata: {
      resourceId,
      name: name,
      externalId: timeseriesExternalId,
      resourceType: 'timeSeries',
    },
  };
};

export default resolveTimeseriesContainerConfig;
