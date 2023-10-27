import dayjs from 'dayjs';
import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';
import omitBy from 'lodash/omitBy';

import { DateRange, TimeseriesFilter } from '@cognite/sdk';

import { SiteConfig } from '../../../config/types';
import { Operator, ValueByField, ValueType } from '../../../types/filters';

export const buildTimeseriesFilter = (
  params?: ValueByField,
  config?: SiteConfig
): TimeseriesFilter | undefined => {
  if (!params) {
    return undefined;
  }

  let filter: TimeseriesFilter = {};

  if (config?.timeseriesConfig?.dataSetIds) {
    filter.dataSetIds = config?.timeseriesConfig?.dataSetIds.map((id) => ({
      id,
    }));
  }

  const asset = getParamValue<string>(params, 'Asset');
  if (asset) {
    filter.assetExternalIds = [asset];
  }

  filter = {
    ...filter,
    externalIdPrefix: getParamValue<string>(params, 'External ID'),
    isStep: getParamValueBoolean(params, 'Is Step'),
    isString: getParamValueBoolean(params, 'Is String'),
    createdTime: getParamValueDate(params, 'Created Time'),
    lastUpdatedTime: getParamValueDate(params, 'Updated Time'),
  };

  return omitBy(filter, isUndefined);
};

const getParamValue = <T extends ValueType>(
  params: ValueByField,
  field: string
) => {
  return params[field]?.value as T | undefined;
};

const getParamValueBoolean = (
  params: ValueByField,
  field: string
): boolean | undefined => {
  const fieldValue = params[field];

  if (!fieldValue) {
    return undefined;
  }

  const { operator } = fieldValue;

  switch (operator) {
    case Operator.IS_TRUE:
      return true;

    case Operator.IS_FALSE:
      return false;

    default:
      return undefined;
  }
};

const getParamValueDate = (
  params: ValueByField,
  field: string
): DateRange | undefined => {
  const fieldValue = params[field];

  if (!fieldValue) {
    return undefined;
  }

  const { operator, value } = fieldValue;

  switch (operator) {
    case Operator.BEFORE:
      return { max: getDateValue(value as Date) };

    case Operator.NOT_BEFORE:
      return { min: getDateValue(value as Date) };

    case Operator.BETWEEN:
      return {
        min: getDateValue(head(value as Date[])),
        max: getDateValue(last(value as Date[])),
      };

    case Operator.AFTER:
      return { min: getDateValue(value as Date) };

    case Operator.NOT_AFTER:
      return { max: getDateValue(value as Date) };

    default:
      return undefined;
  }
};

const getDateValue = (date?: Date) => {
  if (date) {
    return dayjs(date).valueOf();
  }
  return undefined;
};
