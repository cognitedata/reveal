import {
  BooleanFilter,
  DateFilter,
  NumberFilter,
  StringFilter,
} from '../../../containers';
import { FieldType } from '../../../types';

export const getFilterByFieldType = (type: FieldType) => {
  switch (type) {
    case 'string':
      return StringFilter;

    case 'number':
      return NumberFilter;

    case 'boolean':
      return BooleanFilter;

    case 'date':
      return DateFilter;
  }
};
