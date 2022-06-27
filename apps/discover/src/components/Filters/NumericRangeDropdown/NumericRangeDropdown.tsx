import React, { useState, useMemo, useCallback } from 'react';

import { Body, Menu } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';
import { FullWidth } from 'styles/layout';

import {
  DEFAULT_DROPDOWN_MENU_WIDTH,
  DEFAULT_DROPDOWN_LABEL_VARIANT,
} from './constants';
import { Dropdown, DropdownLabel, DropdownValue } from './elements';
import { RangeSelect } from './RangeSelect';
import { NumericRangeDropdownConfig } from './types';

export interface NumericRangeDropdownProps {
  title: string;
  range: number[];
  selectedRange?: number[];
  onChange: (selectedRange: number[]) => void;
  config?: NumericRangeDropdownConfig;
}

export const NumericRangeDropdown: React.FC<NumericRangeDropdownProps> = ({
  title,
  range,
  selectedRange,
  onChange,
  config,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [values, setValues] = useState<number[]>(selectedRange || range);

  const dropdownIcon = useMemo(
    () => (dropdownVisible ? 'ChevronUp' : 'ChevronDown'),
    [dropdownVisible]
  );

  const debounceChange = useDebounce(
    (values: number[]) => onChange(values),
    100
  );

  const handleNumericRangeChange = useCallback(
    (values: number[]) => {
      setValues(values);
      debounceChange(values);
    },
    [debounceChange]
  );

  const [min, max] = values;

  const NumericRangeDropdownContent = useMemo(() => {
    return (
      <Menu>
        <RangeSelect
          range={range}
          selectedRange={values}
          onChange={handleNumericRangeChange}
          width={config?.width || DEFAULT_DROPDOWN_MENU_WIDTH}
        />
      </Menu>
    );
  }, [range, values, config?.width, handleNumericRangeChange]);

  return (
    <FullWidth>
      <Dropdown
        content={NumericRangeDropdownContent}
        appendTo={document.body}
        onClickOutside={() => setDropdownVisible(false)}
        visible={dropdownVisible}
      >
        <DropdownLabel
          variant={config?.variant || DEFAULT_DROPDOWN_LABEL_VARIANT}
          icon={dropdownIcon}
          iconPlacement="right"
          $focused={dropdownVisible}
          onClick={() => setDropdownVisible((prevState) => !prevState)}
        >
          <Body level={2} strong>
            {title}:
          </Body>
          <DropdownValue>
            {min} - {max}
          </DropdownValue>
        </DropdownLabel>
      </Dropdown>
    </FullWidth>
  );
};
