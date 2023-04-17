import { CogniteClient } from '@cognite/sdk';
import { getTimeseriesContainerConfig } from '@cognite/unified-file-viewer';
import { IndustryCanvasContainerConfig } from '../../types';
import {
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from '../../utils/addDimensionsToContainerReference';
import { v4 as uuid } from 'uuid';

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
  }: {
    id?: string | undefined;
    resourceId: number;
    startDate: string;
    endDate: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string;
  }
): Promise<IndustryCanvasContainerConfig> => {
  const timeseries = await sdk.timeseries.retrieve([{ id: resourceId }]);

  if (timeseries.length !== 1) {
    throw new Error('Expected to find exactly one timeseries');
  }

  const name = timeseries[0].name;
  const timeseriesExternalId = timeseries[0].externalId;

  const containerConfig = await getTimeseriesContainerConfig(
    sdk as any,
    {
      id: id || uuid(),
      label: label ?? name ?? timeseriesExternalId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      x: x,
      y: y,
      width: width ?? DEFAULT_TIMESERIES_WIDTH,
      height: height ?? DEFAULT_TIMESERIES_HEIGHT,
    },
    {
      timeseriesId: resourceId,
    }
  );

  return {
    ...containerConfig,
    metadata: {
      resourceId,
      name: name,
      externalId: timeseriesExternalId,
    },
  } as IndustryCanvasContainerConfig;
};

export default resolveTimeseriesContainerConfig;
