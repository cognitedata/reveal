import React, { useEffect, useState, useRef } from 'react';
import {
  Body,
  Icon,
  OptionType,
  Select as CogsSelect,
  Tooltip,
} from '@cognite/cogs.js';
import { Input, Spin } from 'antd';
import { FilterPlaceholder } from 'components/Filters';
import styled from 'styled-components';
import Layers from 'utils/zindex';
import { CustomSelectProps } from './types';
import { selectStyles } from './styles';

export const Select = (props: CustomSelectProps) => {
  const { selectProps, tooltipProps } = props;
  const { title, options = [], ...fixedSelectProps } = selectProps;

  const [blockClose, setBlockClose] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedNr =
    (fixedSelectProps?.value as OptionType<React.ReactText>[])?.length ?? 1;

  const getContainer = () => {
    const els = document.getElementsByClassName('context-ui-pnid-style-scope');
    const el = els.item(0)! as HTMLElement;
    return el;
  };

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
  };

  const preventPrematureClosing = (event: any) => {
    event.preventDefault();
    return false;
  };

  const checkOutsideClick = (event: MouseEvent) => {
    if (
      isMenuOpen &&
      selectRef?.current &&
      !selectRef?.current?.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', checkOutsideClick);
    return () => {
      document.removeEventListener('mousedown', checkOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectRef, isMenuOpen, blockClose]);

  const defaultSelectProps = {
    maxHeight: 36,
    placeholder: 'All',
    styles: selectStyles,
    isClearable: false,
    isSearchable: false,
    backspaceRemovesValue: false, // if true then search input in dropdown cannot be backspaced
    escapeClearsValue: false,
    closeMenuOnSelect: false,
    closeMenuOnScroll: false,
    closeMenuOnBlur: false,
    showCustomCheckbox: fixedSelectProps?.isMulti ?? false,
    enableSelectAll: fixedSelectProps?.isMulti ?? false,
    menuIsOpen: isMenuOpen,
    menuPortalTarget: getContainer(),
    onMouseDown: preventPrematureClosing,
    onMenuOpen: () => setIsMenuOpen(true),
    onMenuClose: () => {
      if (!blockClose) setIsMenuOpen(false);
      setBlockClose(false);
    },
    title: (
      <Body level={2} strong style={{ fontFamily: 'Inter' }}>
        {title}
      </Body>
    ),
    placeholderSelectElement: (
      <FilterPlaceholder text={`${selectedNr} selected`} />
    ),
    options: options.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    ),
    dropdownRender: (menu: any) => (
      <DropdownWrapper ref={selectRef}>
        <Input
          prefix={<Icon type="Search" />}
          value={query}
          onMouseDown={() => setBlockClose(true)}
          onBlur={() => setBlockClose(false)}
          onChange={onFilterChange}
          onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => {
            setIsMenuOpen(false);
            e.preventDefault();
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            // In react-select, default action of spacebar press is to select first option.
            // It prevents using space in the search input, so we disable propagation when spacebar is pressed.
            if (e.key === ' ') e.stopPropagation();
          }}
          style={{ marginBottom: '4px' }}
        />
        {menu}
      </DropdownWrapper>
    ),
  };

  const fixedTooltipProps = {
    content: tooltipProps?.tooltipContent,
    disabled: tooltipProps?.hasPermission ?? true,
    isLoaded: tooltipProps?.isLoaded ?? true,
  };

  return (
    <Tooltip interactive {...fixedTooltipProps}>
      <FilterWrapper
        hasPermission={tooltipProps?.hasPermission}
        onMouseDown={preventPrematureClosing}
      >
        <Spin spinning={!fixedTooltipProps.isLoaded} size="small">
          {/* ignore because cogs' "title" has "string" type - adjust that in cogs! */}
          {/* @ts-ignore */}
          <CogsSelect {...defaultSelectProps} {...fixedSelectProps} />
        </Spin>
      </FilterWrapper>
    </Tooltip>
  );
};

const FilterWrapper = styled.div`
  max-width: 220px;
  min-width: 220px;
  z-index: ${Layers.POPOVER};
  cursor: ${({ hasPermission }: { hasPermission?: boolean }) =>
    !hasPermission ? 'not-allowed' : 'pointer'};
`;
const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  overflow-x: hidden;
`;
