import { SiteConfig } from '@fdx/shared/config/types';
import { ValueByField } from '@fdx/shared/types/filters';
import { convertDateFieldToNumericField } from '@fdx/shared/utils/filter';

import { Timeseries } from '@cognite/sdk';

import { ACDMAdvancedFilter, ACDMFilterBuilder } from '../../../builders';

export const buildTimeseriesAdvancedFilter = ({
  params = {},
  query,
  config,
}: {
  params?: ValueByField<Timeseries>;
  query?: string;
  config?: SiteConfig;
}): ACDMAdvancedFilter<Timeseries> | undefined => {
  const {
    name,
    isString,
    isStep,
    unit,
    assetId,
    createdTime,
    lastUpdatedTime,
    ...metadata
  } = params;

  const builder = new ACDMFilterBuilder<Timeseries>()
    .construct('name', name)
    .construct('isString', isString)
    .construct('isStep', isStep)
    .construct('unit', unit)
    .construct('assetId', assetId)
    .construct('createdTime', () => {
      return convertDateFieldToNumericField(createdTime);
    })
    .construct('lastUpdatedTime', () => {
      return convertDateFieldToNumericField(lastUpdatedTime);
    });

  const metadataBuilder = new ACDMFilterBuilder<Timeseries>();
  Object.entries(metadata).forEach(([metadataKey, metadataValue]) => {
    metadataBuilder.construct(
      metadataKey as `metadata.${string}`,
      metadataValue
    );
  });
  builder.or(metadataBuilder);

  const searchQueryBuilder = new ACDMFilterBuilder<Timeseries>().search(
    'name',
    query
  );
  builder.or(searchQueryBuilder);

  const dataSetIds = config?.timeseriesConfig?.dataSetIds;
  const dataSetIdsBuilder = new ACDMFilterBuilder<Timeseries>();
  dataSetIds?.forEach((dataSetId) => {
    dataSetIdsBuilder.equals('dataSetId', dataSetId);
  });
  builder.or(dataSetIdsBuilder);

  return new ACDMFilterBuilder<Timeseries>().and(builder).build();
};
