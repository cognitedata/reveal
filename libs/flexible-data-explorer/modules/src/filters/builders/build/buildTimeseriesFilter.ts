import { SiteConfig } from '@fdx/shared/config/types';
import { Property, ValueByField } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

import { Timeseries } from '@cognite/sdk';

import { ACDMFilterBuilder } from '../ACDMFilterBuilder';

export const buildTimeseriesFilter = (
  params?: ValueByField<Timeseries>,
  config?: SiteConfig
) => {
  if (!params) {
    return undefined;
  }

  const builder = new ACDMFilterBuilder<Timeseries>();

  Object.entries(params).forEach(([property, fieldValue]) => {
    builder.construct(property as Property<Timeseries>, fieldValue);
  });

  const dataSetIds = config?.timeseriesConfig?.dataSetIds;

  if (dataSetIds && !isEmpty(dataSetIds)) {
    const dataSetIdsBuilder = new ACDMFilterBuilder<Timeseries>();

    dataSetIds.forEach((dataSetId) => {
      dataSetIdsBuilder.equals('dataSetId', dataSetId);
    });

    builder.and(new ACDMFilterBuilder<Timeseries>().or(dataSetIdsBuilder));
  }

  return new ACDMFilterBuilder<Timeseries>().and(builder).build();
};
