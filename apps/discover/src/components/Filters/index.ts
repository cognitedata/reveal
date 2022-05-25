import { CheckBoxes } from './CheckBoxes/CheckBoxes';
import { MultiSelect } from './MultiSelect/MultiSelect';
import { NumericRangeFilter } from './NumericRange/NumericRangeFilter';

export { CheckBoxes } from './CheckBoxes/CheckBoxes';
export { NumericRangeFilter } from './NumericRange/NumericRangeFilter';
export { MultiSelect } from './MultiSelect/MultiSelect';
export { MultiSelectCategorized } from './MultiSelectCategorized/MultiSelectCategorized';
export { NumericRangeDropdown } from './NumericRangeDropdown/NumericRangeDropdown';
export { SearchBox } from './SearchBox/SearchBox';

export const filters = {
  DATE_RANGE: 'date_range',
  CHECK_BOXES: 'check_boxes',
  NUMERIC_RANGE: 'numeric_range',
  MULTI_SELECT: 'multi_select',
};

export const filterMap = {
  [filters.CHECK_BOXES]: CheckBoxes,
  [filters.NUMERIC_RANGE]: NumericRangeFilter,
  [filters.MULTI_SELECT]: MultiSelect,
};
