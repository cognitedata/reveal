import * as React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { EMPTY_OBJECT, useDeepEffect } from '@data-exploration-lib/core';
import styled from 'styled-components';

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
  onSearchInputChange?: (newValue: string) => void;
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
  onSearchInputChange,
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
          onSearchInputChange={onSearchInputChange}
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
        <StyledButton
          type="secondary"
          icon="ChevronDown"
          iconPlacement="right"
          loading={isLoading}
          style={{
            width,
            background: 'var(--cogs-bg-control--secondary)',
            fontWeight: 400,
            height: 40,

            color:
              Object.keys(selection).length === 0
                ? 'var(--cogs-text-icon--muted)'
                : 'initial',
          }}
        >
          <FilterButtonText data-testid="filter-button">
            {getFilterButtonText(selection)}
          </FilterButtonText>
        </StyledButton>
      </>
    </Dropdown>
  );
};

const StyledButton = styled(Button)`
  .cogs-icon {
    position: relative;
    svg {
      transform: scale(1.25);
    }
    &:before {
      content: '';
      width: 1px;
      height: 20px;
      position: absolute;
      top: 0;
      left: -10px;
      background: #cccccc;
    }
  }
`;
