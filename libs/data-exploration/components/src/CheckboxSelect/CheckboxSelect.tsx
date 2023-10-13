import * as React from 'react';

import styled from 'styled-components';

import { Button, Dropdown, DropdownProps } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  useDeepEffect,
  useTranslation,
} from '@data-exploration-lib/core';

import { FilterLabel } from '../Labels';

import { ApplyButton } from './components/ApplyButton';
import { OptionsMenu } from './components/OptionsMenu';
import { FilterButtonText } from './elements';
import {
  OptionType,
  OptionSelection,
  WidthProps,
  CustomMetadataValue,
} from './types';
import { getFilterButtonText } from './utils/getFilterButtonText';

type MenuProps = {
  placement?: DropdownProps['placement'];
};

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
  menuProps?: MenuProps;
  submenuOpenDelay?: number;
} & WidthProps;

export const CheckboxSelect = ({
  enableSorting = false,
  isLoading,
  label,
  menuProps,
  onChange,
  onClickApply,
  onSearchInputChange,
  options,
  selection: customSelection,
  useCustomMetadataValuesQuery,
  width,
  submenuOpenDelay,
}: CheckboxSelectProps) => {
  const { t } = useTranslation();

  const [selection, setSelection] = React.useState<OptionSelection>(
    customSelection || EMPTY_OBJECT
  );

  const [visible, setVisible] = React.useState<boolean>(false);

  // Trigger local state when the metadata filter selection is
  // changed from "outside sources" (e.g., filter tag, url, etc...)
  useDeepEffect(() => {
    setSelection(customSelection || EMPTY_OBJECT);
  }, [customSelection]);

  const handleChange = (newSelection: OptionSelection) => {
    setSelection(newSelection);
    onChange?.(newSelection);
  };

  const onCloseMenuHandler = () => {
    setVisible(false);
  };

  return (
    <Dropdown
      onClickOutside={() => {
        if (onSearchInputChange) {
          onSearchInputChange('');
        }
        setVisible(false);
      }}
      visible={visible}
      content={
        <OptionsMenu
          data-testid={`select-${label}-menu-list`}
          isLoading={isLoading}
          options={options}
          selection={selection}
          onChange={handleChange}
          useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
          onSearchInputChange={onSearchInputChange}
          onCloseMenu={onCloseMenuHandler}
          footer={
            onClickApply && (
              <ApplyButton
                // disabled={isEmpty(selection)}
                onClick={() => onClickApply(selection)}
              />
            )
          }
          enableSorting={enableSorting}
          submenuOpenDelay={submenuOpenDelay}
          {...menuProps}
        />
      }
    >
      <div data-testid={`filter-${label}`}>
        {label && <FilterLabel>{label}</FilterLabel>}
        <StyledButton
          data-testid={`select-${label}`}
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
          onClick={() => setVisible((prevState) => !prevState)}
        >
          <FilterButtonText data-testid="filter-button">
            {getFilterButtonText(selection, t)}
          </FilterButtonText>
        </StyledButton>
      </div>
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
