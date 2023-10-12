import React, { useRef, useState, useEffect } from 'react';

import styled from 'styled-components';

import { Spin } from 'antd';

import {
  Body,
  Button,
  OptionType,
  Select as CogsSelect,
} from '@cognite/cogs.js';

import Layers from '../../../../utils/zindex';
import { FilterPlaceholder } from '../../../Filters';
import { Flex } from '../../atoms';

import { selectStyles } from './styles';
import { CustomSelectProps } from './types';

export const Select = (props: CustomSelectProps) => {
  const { selectProps, tooltipProps } = props;
  const { title, options = [], ...fixedSelectProps } = selectProps;
  const dropdownRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showSelectMenu, setShowSelectMenu] = useState(false);

  const selectedNr =
    (fixedSelectProps?.value as OptionType<React.ReactText>[])?.length ?? 1;

  const fixedTooltipProps = {
    content: tooltipProps?.tooltipContent,
    disabled: tooltipProps?.hasPermission ?? true,
    isLoaded: tooltipProps?.isLoaded ?? true,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSelectMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <FilterWrapper
      hasPermission={tooltipProps?.hasPermission}
      ref={containerRef}
    >
      <Spin spinning={!fixedTooltipProps.isLoaded} size="small">
        <StyledButton
          type="tertiary"
          icon="ChevronDown"
          iconPlacement="right"
          onClick={() => {
            setShowSelectMenu(true);
          }}
          data-testid={`${selectProps['data-testid']}-select`}
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
        {showSelectMenu && (
          <DropdownWrapper ref={dropdownRef}>
            <CogsSelect
              autoFocus
              maxHeight={36}
              icon="Search"
              styles={selectStyles}
              isClearable={false}
              isSearchable={true}
              tabSelectsValue={false}
              escapeClearsValue={false}
              backspaceRemovesValue={false} // if true, then search input in dropdown cannot be backspaced
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              showCheckbox={fixedSelectProps?.isMulti ?? false}
              enableSelectAll={fixedSelectProps?.isMulti ?? false}
              menuPortalTarget={dropdownRef.current?.target}
              menuIsOpen
              options={options}
              {...fixedSelectProps}
              placeholder=""
            />
          </DropdownWrapper>
        )}
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
  position: absolute;
  display: flex;
  flex-direction: column;
  max-width: 220px;
  min-width: 220px;
  padding: 8px;
  box-sizing: border-box;
  overflow-x: hidden;
  background-color: white;
  box-shadow: 0 8px 16px 4px rgba(0, 0, 0, 0.04), 0 2px 12px rgba(0, 0, 0, 0.08);
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
