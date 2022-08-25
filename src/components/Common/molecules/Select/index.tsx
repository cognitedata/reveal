import React, { useRef } from 'react';
import {
  Body,
  Button,
  Dropdown,
  OptionType,
  Select as CogsSelect,
} from '@cognite/cogs.js';
import { Spin } from 'antd';
import { Flex } from 'components/Common';
import { FilterPlaceholder } from 'components/Filters';
import styled from 'styled-components';
import Layers from 'utils/zindex';
import { CustomSelectProps } from './types';
import { selectStyles } from './styles';

export const Select = (props: CustomSelectProps) => {
  const { selectProps, tooltipProps } = props;
  const { title, options = [], ...fixedSelectProps } = selectProps;
  const dropdownRef = useRef<any>(null);

  const selectedNr =
    (fixedSelectProps?.value as OptionType<React.ReactText>[])?.length ?? 1;

  const fixedTooltipProps = {
    content: tooltipProps?.tooltipContent,
    disabled: tooltipProps?.hasPermission ?? true,
    isLoaded: tooltipProps?.isLoaded ?? true,
  };

  const selectMenu = (
    <DropdownWrapper>
      <CogsSelect
        autoFocus
        maxHeight={36}
        icon="Search"
        styles={selectStyles}
        isClearable={false}
        isSearchable={false}
        tabSelectsValue={false}
        escapeClearsValue={false}
        backspaceRemovesValue={false} // if true, then search input in dropdown cannot be backspaced
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        showCustomCheckbox={fixedSelectProps?.isMulti ?? false}
        enableSelectAll={fixedSelectProps?.isMulti ?? false}
        menuPortalTarget={dropdownRef.current?.target}
        menuIsOpen
        options={options}
        {...fixedSelectProps}
        placeholder=""
      />
    </DropdownWrapper>
  );

  return (
    <FilterWrapper hasPermission={tooltipProps?.hasPermission}>
      <Spin spinning={!fixedTooltipProps.isLoaded} size="small">
        <Dropdown content={selectMenu} ref={dropdownRef}>
          <StyledButton
            type="tertiary"
            icon="ChevronDown"
            iconPlacement="right"
          >
            <Flex row>
              <Body level={2} strong>
                {title}
              </Body>
              <FilterPlaceholder
                text={selectedNr ? `${selectedNr} selected` : 'All'}
              />
            </Flex>
          </StyledButton>
        </Dropdown>
      </Spin>
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  max-width: 220px;
  min-width: 220px;
  box-sizing: border-box;
  cursor: ${({ hasPermission }: { hasPermission?: boolean }) =>
    !hasPermission ? 'not-allowed' : 'pointer'};
`;

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 220px;
  min-width: 220px;
  padding: 8px;
  box-sizing: border-box;
  overflow-x: hidden;
  background-color: white;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  z-index: ${Layers.POPOVER};

  .cogs-select .cogs-select__menu {
    padding: 0;
    margin: 4px 0 0 0;
    box-shadow: none !important;
  }
  .cogs-select .cogs-select__menu-list {
    overflow-x: hidden;
  }
  .cogs-select .cogs-select__divider {
    margin: 4px 0 4px -4px;
  }
  .cogs-select .cogs-select__indicator {
    display: none;
  }
`;
