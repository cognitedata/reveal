import isDate from 'lodash/isDate';
import isEmpty from 'lodash/isEmpty';

import { DocumentFilter } from '@cognite/sdk';

import { SiteConfig } from '../../../../config/types';
import {
  DateRange,
  NumericRange,
  Operator,
  ValueByField,
} from '../../../containers/Filter';
import { getTimestamp } from '../../date';

type Builder = (field: string, value: any) => DocumentFilter;
type Builders = Record<Operator, Builder>;

export const buildFilesFilter = (
  params?: ValueByField,
  config?: SiteConfig
): DocumentFilter | undefined => {
  const filters = Object.entries(params ?? {}).reduce(
    (result, [field, { operator, value }]) => {
      const builder = getBuilder(field, operator);
      const build = builder(field, value);
      return [...result, build];
    },
    [] as DocumentFilter[]
  );

  if (config?.fileConfig?.dataSetIds) {
    filters.push({
      in: {
        property: ['sourceFile', 'datasetId'],
        values: config?.fileConfig?.dataSetIds,
      },
    });
  }

  if (isEmpty(filters)) {
    return undefined;
  }

  return { and: filters };
};

const getBuilder = (field: string, operator: Operator): Builder => {
  const defaultBuilder = builders[operator];

  switch (field) {
    case 'Label':
      return labelFilterBuilders[operator] || defaultBuilder;
    case 'Asset':
      return assetFilterBuilders[operator] || defaultBuilder;
    default:
      return defaultBuilder;
  }
};

const builders: Builders = {
  [Operator.STARTS_WITH]: (field: string, value: string) => ({
    prefix: { property: getProperty(field), value },
  }),
  [Operator.NOT_STARTS_WITH]: (field: string, value: string) => ({
    not: builders[Operator.STARTS_WITH](field, value),
  }),

  [Operator.CONTAINS]: (field: string, value: string) => ({
    in: { property: getProperty(field), values: [value] },
  }),
  [Operator.NOT_CONTAINS]: (field: string, value: string) => ({
    not: builders[Operator.CONTAINS](field, value),
  }),

  [Operator.BETWEEN]: (field: string, value: NumericRange | DateRange) => ({
    range: {
      property: getProperty(field),
      gte: getRangeValue(value[0]),
      lte: getRangeValue(value[1]),
    },
  }),
  [Operator.NOT_BETWEEN]: (field: string, value: NumericRange | DateRange) => ({
    not: builders[Operator.BETWEEN](field, value),
  }),

  [Operator.GREATER_THAN]: (field: string, value: number) => ({
    range: { property: getProperty(field), gt: value },
  }),
  [Operator.LESS_THAN]: (field: string, value: number) => ({
    range: { property: getProperty(field), lt: value },
  }),

  [Operator.EQUALS]: (field: string, value: string | number | boolean) => ({
    equals: { property: getProperty(field), value },
  }),
  [Operator.NOT_EQUALS]: (field: string, value: string | number | boolean) => ({
    not: builders[Operator.EQUALS](field, value),
  }),

  [Operator.BEFORE]: (field: string, value: Date) => ({
    range: { property: getProperty(field), lt: getRangeValue(value) },
  }),
  [Operator.NOT_BEFORE]: (field: string, value: Date) => ({
    not: builders[Operator.BEFORE](field, value),
  }),

  [Operator.AFTER]: (field: string, value: Date) => ({
    range: { property: getProperty(field), gt: getRangeValue(value) },
  }),
  [Operator.NOT_AFTER]: (field: string, value: Date) => ({
    not: builders[Operator.AFTER](field, value),
  }),

  [Operator.ON]: (field: string, value: Date) => ({
    equals: { property: getProperty(field), value: getTimestamp(value) },
  }),
  [Operator.NOT_ON]: (field: string, value: Date) => ({
    not: builders[Operator.ON](field, value),
  }),

  [Operator.IS_TRUE]: (field: string) => ({
    equals: { property: getProperty(field), value: true },
  }),
  [Operator.IS_FALSE]: (field: string) => ({
    equals: { property: getProperty(field), value: false },
  }),

  [Operator.IS_SET]: (field: string) => ({
    exists: { property: getProperty(field) },
  }),
  [Operator.IS_NOT_SET]: (field: string) => ({
    not: { exists: { property: getProperty(field) } },
  }),
};

const labelFilterBuilders: Partial<Builders> = {
  [Operator.CONTAINS]: (field: string, value: string) => ({
    containsAny: {
      property: getProperty(field),
      values: [{ externalId: value }],
    },
  }),
  [Operator.NOT_CONTAINS]: (field: string, value: string) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    not: labelFilterBuilders[Operator.CONTAINS]!(field, value),
  }),
};

const assetFilterBuilders: Partial<Builders> = {
  [Operator.CONTAINS]: (field: string, value: string) => ({
    inAssetSubtree: { property: getProperty(field), values: [value] },
  }),
  [Operator.NOT_CONTAINS]: (field: string, value: string) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    not: assetFilterBuilders[Operator.CONTAINS]!(field, value),
  }),
};

const FIELD_PROPERTY_MAP: Record<string, string> = {
  'Data Set': 'sourceFile.datasetId',
  Asset: 'assetIds',
  'External ID': 'externalId',
  'Internal ID': 'id',
  Label: 'labels',
  Type: 'type',
  Author: 'author',
  Source: 'sourceFile.source',
  'Created Time': 'createdTime',
  'Updated Time': 'modifiedTime',
};

const getProperty = (field: string) => {
  return FIELD_PROPERTY_MAP[field].split('.');
};

const getRangeValue = (value: number | Date): number => {
  if (isDate(value)) {
    return getTimestamp(value);
  }
  return value;
};
