import { Resource } from '@data-exploration-components/hooks';
import { ResourceType } from '@data-exploration-components/types';
import { renderTitle } from '@data-exploration-components/utils';

import {
  Asset,
  CogniteEvent,
  FileInfo,
  Sequence,
  Timeseries,
} from '@cognite/sdk/dist/src';

export const getBreadcrumbTitle = (
  type: ResourceType,
  data?: Resource
): string => {
  if (!data) {
    return '';
  }

  if (type === 'asset') {
    return (data as Asset).name;
  }
  if (type === 'timeSeries') {
    const timeseriesData = data as Timeseries;
    return (
      timeseriesData.name ||
      timeseriesData.externalId ||
      String(timeseriesData.id)
    );
  }
  if (type === 'file') {
    return (data as FileInfo).name;
  }
  if (type === 'event') {
    return renderTitle(data as CogniteEvent);
  }
  if (type === 'sequence') {
    const sequenceData = data as Sequence;
    return (
      sequenceData.name || sequenceData.externalId || String(sequenceData.id)
    );
  }

  return '';
};
