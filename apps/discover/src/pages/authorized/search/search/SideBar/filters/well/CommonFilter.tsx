import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import {
  FilterConfig,
  FilterTypes,
  WellFilterOption,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { CheckboxElement } from './CheckboxElement';
import { DateRangeElement } from './DateRangeElement';
import { MultiSelectElement } from './MultiSelectElement';
import { MultiSelectGroupElement } from './MultiSelectGroupElement';
import { NumericRangeFilterElement } from './NumericRangeFilterElement';

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
  const options = useMemo(
    () =>
      originalOptions.map((option: any) =>
        isUndefined(option.value?.value)
          ? option || { value: 0 }
          : option.value || { value: 0 }
      ),
    [originalOptions]
  );

  const title = displayFilterTitle ? filterName : '';

  if (
    filterType === FilterTypes.MULTISELECT ||
    (filterType === FilterTypes.CHECKBOXES &&
      (options.length >= 10 || isEmpty(options)))
  ) {
    // console.log('Multiselect:', title || 'unknown');
    returnElement = (
      <MultiSelectElement
        onValueChange={onValueChange}
        groupedOptions={groupedOptions}
        options={options}
        selectedOptions={selectedOptions}
        title={title}
        isTextCapitalized={isTextCapitalized}
        filterId={filterId}
        footer={footer}
      />
    );
  } else if (filterType === FilterTypes.MULTISELECT_GROUP) {
    returnElement = (
      <MultiSelectGroupElement
        onValueChange={onValueChange}
        groupedOptions={groupedOptions}
        selectedOptions={selectedOptions}
        title={title}
        isTextCapitalized={isTextCapitalized}
        filterId={filterId}
        footer={footer}
      />
    );
  } else if (filterType === FilterTypes.CHECKBOXES) {
    // console.log('Checkbox:', title || 'unknown');
    returnElement = (
      <CheckboxElement
        onValueChange={onValueChange}
        options={options}
        selectedOptions={selectedOptions}
        title={title}
        filterId={filterId}
      />
    );
  } else if (filterType === FilterTypes.DATE_RANGE) {
    // console.log('Date:', title || 'unknown');
    returnElement = (
      <DateRangeElement
        onValueChange={onValueChange}
        options={options}
        selectedOptions={selectedOptions}
        filterName={filterName}
        filterId={filterId}
      />
    );
  } else {
    // console.log('Numeric:', title || 'unknown');
    returnElement = (
      <NumericRangeFilterElement
        onValueChange={onValueChange}
        selectedOptions={selectedOptions}
        options={options}
        filterName={filterName}
        filterId={filterId}
        displayFilterTitle={displayFilterTitle}
      />
    );
  }

  return <div data-testid="filter-item-wrapper">{returnElement}</div>;
};
