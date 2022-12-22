import { CustomFilterModel } from '@cognite/cog-data-grid-root/lib/types';
import {
  QueryFilter,
  FieldFilter,
  DataModelTypeDefsField,
} from '@platypus/platypus-core';
import { ISimpleFilterModelType } from 'ag-grid-community/dist/lib/filter/provided/simpleFilter';

import { INSTANCE_TYPE_DEFS_FIELD } from './constants';

export const convertFilterToDataType = (
  itemValue: undefined | null | string | number | object | boolean,
  dataType: string
): undefined | null | string | number | object | boolean => {
  if (
    itemValue === undefined ||
    itemValue == null ||
    typeof itemValue === 'object'
  ) {
    return itemValue;
  }

  if (dataType === 'Boolean') {
    return itemValue.toString().toLowerCase() === 'true';
  }

  if (['Int', 'Int64', 'Float'].includes(dataType)) {
    return +itemValue.toString().trim();
  }

  return itemValue.toString().trim();
};

export const convertAgFilterToApiFilter = (
  filterType: ISimpleFilterModelType | 'containsAny' | 'containsAll',
  filterValue: CustomFilterModel['filter']
) => {
  switch (filterType) {
    case 'greaterThan':
      return { gt: +filterValue };

    case 'greaterThanOrEqual':
      return { gte: +filterValue };

    case 'lessThan':
      return { lt: +filterValue };

    case 'lessThanOrEqual':
      return { lte: +filterValue };

    case 'startsWith':
      return { prefix: filterValue };

    case 'inRange':
      return filterValue;

    case 'blank':
      return { isNull: true };

    case 'notBlank':
      return { isNull: false };

    case 'equals':
      return { eq: filterValue };

    case 'containsAny':
      return { containsAny: filterValue };

    case 'containsAll':
      return { containsAll: filterValue };

    default:
      return;
  }
};

export const convertToGraphQlFilters = (
  filterModel: Record<string, CustomFilterModel>,
  dataModelTypeFields: DataModelTypeDefsField[]
): QueryFilter | undefined => {
  const and: QueryFilter[] = [];

  for (const key in filterModel) {
    const filter = {} as FieldFilter;
    const filterKey = key as string;
    const agGridFilter = filterModel[key];

    let filterValue = agGridFilter.filter;

    const { filterType, filterTo, type } = agGridFilter;

    const dataModelField = [
      INSTANCE_TYPE_DEFS_FIELD,
      ...dataModelTypeFields,
    ].find((field) => field.name === key);

    if (!dataModelField) {
      continue;
    }

    if (dataModelField.type.list) {
      filterValue = filterValue
        .split(',')
        .map((itemVal: string) =>
          convertFilterToDataType(itemVal, dataModelField.type.name)
        );
    } else if (dataModelField.type.custom && filterTo) {
      filterValue[filterType][type] = convertFilterToDataType(
        filterValue[filterType][type],
        filterTo
      );
    } else if (type === 'inRange') {
      filterValue = convertFilterToDataType(
        { gte: filterValue, lte: filterTo },
        dataModelField.type.name
      );
    } else {
      filterValue = convertFilterToDataType(
        filterValue,
        dataModelField.type.name
      );
    }

    if (dataModelField.type.custom) {
      filter[filterKey] = {
        [filterType]: convertAgFilterToApiFilter(
          type,
          filterValue[filterType][type]
        ),
      };
    } else {
      const converted = convertAgFilterToApiFilter(type, filterValue);

      if (converted) {
        filter[filterKey] = converted;
      }
    }

    and.push(filter);
  }

  return and.length > 0 ? { and } : undefined;
};
