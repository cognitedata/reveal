import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import layers from 'utils/zindex';

import { NumericRangeFilter, MultiSelect } from 'components/Filters';
import { MultiSelectGroup } from 'components/Filters/MultiSelect/MultiSelectGroup';
import {
  FilterConfig,
  FilterTypes,
  WellFilterOption,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { Checkboxes } from '../../components/Checkboxes';

import { DateRange, DateRangeFilter } from './DateRangeFilter';
import { MultiSelectWrapper } from './elements';

export type Props = {
  filterConfig: Pick<
    FilterConfig,
    'type' | 'id' | 'name' | 'isTextCapitalized'
  >;
  onValueChange: (filterId: number, value: any) => void;
  groupedOptions?: {
    label: string;
    options: (WellFilterOption | WellFilterOptionValue)[];
  }[];
  options: (WellFilterOption | WellFilterOptionValue)[];
  selectedOptions: string | WellFilterOptionValue[];
  displayFilterTitle?: boolean;
  footer?: () => React.ReactElement;
};

export const CommonFilter = ({
  filterConfig,
  onValueChange,
  selectedOptions,
  groupedOptions,
  options: originalOptions,
  displayFilterTitle = true,
  footer,
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
    isUndefined(option.value?.value)
      ? option || { value: 0 }
      : option.value || { value: 0 }
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

  const title = displayFilterTitle ? filterName : '';

  const createMultiSelectElement = () => (
    <MultiSelectWrapper>
      <MultiSelect
        options={options}
        groupedOptions={groupedOptions}
        selectedOptions={
          isArray(selectedOptions) ? selectedOptions : [selectedOptions]
        }
        title={title}
        titlePlacement="top"
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
        isTextCapitalized={isTextCapitalized}
        footer={footer}
      />
    </MultiSelectWrapper>
  );

  const createMultiSelectGroupElement = () => (
    <MultiSelectWrapper>
      <MultiSelectGroup
        groupedOptions={groupedOptions}
        selectedOptions={
          isArray(selectedOptions) ? selectedOptions : [selectedOptions]
        }
        title={title}
        titlePlacement="top"
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
        isTextCapitalized={isTextCapitalized}
        footer={footer}
        styles={{
          groupHeading: (base: any) => ({
            ...base,
            textTransform: 'inherit',
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: layers.FILTER_HEADER,
          }),
        }}
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
        title={title}
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
      />
    );
  };

  const createNumericRangeFilter = () => {
    return (
      <NumericRangeFilter
        min={map(options, 'value')[0]}
        max={map(options, 'value')[1]}
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
      (options.length >= 10 || isEmpty(options)))
  ) {
    // console.log('Multiselect:', title || 'unknown');
    returnElement = createMultiSelectElement();
  } else if (filterType === FilterTypes.MULTISELECT_GROUP) {
    returnElement = createMultiSelectGroupElement();
  } else if (filterType === FilterTypes.CHECKBOXES) {
    // console.log('Checkbox:', title || 'unknown');
    returnElement = createCheckboxElement();
  } else if (filterType === FilterTypes.DATE_RANGE) {
    // console.log('Date:', title || 'unknown');
    returnElement = createDateRangeElement();
  } else {
    // console.log('Numeric:', title || 'unknown');
    returnElement = createNumericRangeFilter();
  }

  return <div data-testid="filter-item-wrapper">{returnElement}</div>;
};
