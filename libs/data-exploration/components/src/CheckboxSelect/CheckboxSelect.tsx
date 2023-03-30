import * as React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { EMPTY_OBJECT, useDeepEffect } from '@data-exploration-lib/core';

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
import { FilterLabel } from '../Labels';

export type CheckboxSelectProps = {
  selection?: OptionSelection;
  options: Array<OptionType>;
  label?: string;
  onChange?: (selection: OptionSelection) => void;
  onClickApply?: (selection: OptionSelection) => void;
  enableSorting?: boolean;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
  isLoading?: boolean;
} & WidthProps;

export const CheckboxSelect = ({
  selection: customSelection,
  options,
  label,
  onChange,
  onClickApply,
  useCustomMetadataValuesQuery,
  enableSorting = false,
  width,
  isLoading,
}: CheckboxSelectProps) => {
  const [selection, setSelection] = React.useState<OptionSelection>(
    customSelection || EMPTY_OBJECT
  );

  // Trigger local state when the metadata filter selection is
  // changed from "outside sources" (e.g., filter tag, url, etc...)
  useDeepEffect(() => {
    setSelection(customSelection || EMPTY_OBJECT);
  }, [customSelection]);

  const handleChange = (newSelection: OptionSelection) => {
    setSelection(newSelection);
    onChange?.(newSelection);
  };

  return (
    <Dropdown
      content={
        <OptionsMenu
          isLoading={isLoading}
          options={options}
          selection={selection}
          onChange={handleChange}
          useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
          footer={
            onClickApply && (
              <ApplyButton
                // disabled={isEmpty(selection)}
                onClick={() => onClickApply(selection)}
              />
            )
          }
          enableSorting={enableSorting}
        />
      }
    >
      <>
        {label && <FilterLabel>{label}</FilterLabel>}
        <Button icon="ChevronDown" iconPlacement="right" style={{ width }}>
          <FilterButtonText data-testid="filter-button">
            {getFilterButtonText(selection)}
          </FilterButtonText>
        </Button>
      </>
    </Dropdown>
  );
};
