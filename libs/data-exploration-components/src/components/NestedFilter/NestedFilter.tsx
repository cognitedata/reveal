import * as React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import isEmpty from 'lodash/isEmpty';

import { FilterButtonText } from './elements';
import { OptionType, NestedFilterSelection, WidthProps } from './types';
import { OptionsMenu } from './components/OptionsMenu';
import { ApplyButton } from './components/ApplyButton';
import { getFilterButtonText } from './utils/getFilterButtonText';

export type NestedFilterProps = {
  options: Array<OptionType>;
  onChange?: (selection: NestedFilterSelection) => void;
  onClickApply?: (selection: NestedFilterSelection) => void;
  enableSorting?: boolean;
} & WidthProps;

export const NestedFilter: React.FC<NestedFilterProps> = ({
  options,
  onChange,
  onClickApply,
  enableSorting = false,
  width,
  fullWidth,
}) => {
  const [selection, setSelection] =
    React.useState<NestedFilterSelection>(EMPTY_OBJECT);

  const handleChange = (newSelection: NestedFilterSelection) => {
    setSelection(newSelection);
    onChange?.(newSelection);
  };

  return (
    <Dropdown
      content={
        <OptionsMenu
          options={options}
          selection={selection}
          onChange={handleChange}
          footer={
            onClickApply && (
              <ApplyButton
                disabled={isEmpty(selection)}
                onClick={() => onClickApply(selection)}
              />
            )
          }
          enableSorting={enableSorting}
        />
      }
    >
      <Button icon="ChevronDown" iconPlacement="right" style={{ width }}>
        <FilterButtonText data-testid="filter-button">
          {getFilterButtonText(selection)}
        </FilterButtonText>
      </Button>
    </Dropdown>
  );
};
