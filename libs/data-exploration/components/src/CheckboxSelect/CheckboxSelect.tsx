import * as React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import isEmpty from 'lodash/isEmpty';

import { FilterButtonText } from './elements';
import {
  OptionType,
  OptionSelection,
  WidthProps,
  CustomMetadataValue,
} from './types';
import { OptionsMenu } from './components/OptionsMenu';
import { ApplyButton } from './components/ApplyButton';
import { getFilterButtonText } from './utils/getFilterButtonText';

export type CheckboxSelectProps = {
  options: Array<OptionType>;
  onChange?: (selection: OptionSelection) => void;
  onClickApply?: (selection: OptionSelection) => void;
  enableSorting?: boolean;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
} & WidthProps;

export const CheckboxSelect = ({
  options,
  onChange,
  onClickApply,
  useCustomMetadataValuesQuery,
  enableSorting = false,
  width,
}: CheckboxSelectProps) => {
  const [selection, setSelection] =
    React.useState<OptionSelection>(EMPTY_OBJECT);

  const handleChange = (newSelection: OptionSelection) => {
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
          useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
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
