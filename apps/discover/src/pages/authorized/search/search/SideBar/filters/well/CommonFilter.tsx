import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import { NumericRangeFilter, MultiSelect } from 'components/filters';
import {
  FilterConfig,
  FilterTypes,
  WellFilterOption,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { Checkboxes } from '../../components/Checkboxes';

import { DateRange, DateRangeFilter } from './DateRangeFilter';
import { MultiSelectWrapper } from './elements';

type Props = {
  filterConfig: FilterConfig;
  onValueChange: (filterId: number, value: any) => void;
  options: (WellFilterOption | WellFilterOptionValue)[];
  selectedOptions: string | WellFilterOptionValue[];
  displayFilterTitle?: boolean;
};

export const CommonFilter = ({
  filterConfig,
  onValueChange,
  selectedOptions,
  options: originalOptions,
  displayFilterTitle = true,
}: Props) => {
  const {
    type: filterType,
    id: filterId,
    name: filterName,
    isTextCapitalized,
  } = filterConfig;

  let returnElement: JSX.Element | undefined;

  /**
   * This issue was introduced when integrating the new wells SDK.
   * @TODO: Filter types should be typed properly and casting to `any` should be removed.
   */
  const options = originalOptions.map((option: any) =>
    isUndefined(option.value.value) ? option : option.value
  );

  const createDateRangeElement = () => (
    <DateRangeFilter
      title={filterName}
      minMaxRange={map(options, 'value')}
      range={selectedOptions as DateRange}
      onChange={(range) => {
        onValueChange(filterId, range);
      }}
    />
  );

  const createMultiSelectElement = () => (
    <MultiSelectWrapper>
      <MultiSelect
        options={options}
        selectedOptions={
          isArray(selectedOptions) ? selectedOptions : [selectedOptions]
        }
        title={displayFilterTitle ? filterName : ''}
        titlePlacement="top"
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
        isTextCapitalized={isTextCapitalized}
      />
    </MultiSelectWrapper>
  );

  const createCheckboxElement = () => {
    const data = sortBy(options, 'value').map((option) => ({
      name: option.value,
      count: option.count,
      selected:
        isArray(selectedOptions) && selectedOptions.includes(option.value),
    }));
    return (
      <Checkboxes
        data={data}
        title={displayFilterTitle ? filterName : ''}
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
      />
    );
  };

  const createNumericRangeFilter = () => {
    return (
      <NumericRangeFilter
        values={map(options, 'value')}
        selectedValues={selectedOptions as number[]}
        onValueChange={(vals: any) => onValueChange(filterId, vals)}
        config={{
          title: (displayFilterTitle && filterName) || '',
          editableTextFields: true,
        }}
      />
    );
  };

  if (
    filterType === FilterTypes.MULTISELECT ||
    (filterType === FilterTypes.CHECKBOXES &&
      (options.length >= 10 || options.length === 0))
  ) {
    returnElement = createMultiSelectElement();
  } else if (filterType === FilterTypes.CHECKBOXES) {
    returnElement = createCheckboxElement();
  } else if (filterType === FilterTypes.DATE_RANGE) {
    returnElement = createDateRangeElement();
  } else {
    returnElement = createNumericRangeFilter();
  }

  return <div data-testid="filter-item-wrapper">{returnElement}</div>;
};
