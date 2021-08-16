import React, { useState } from 'react';
import { Input } from 'antd';
import { Body, Icon, OptionType, Select as CogsSelect } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { FilterWrapper, FilterPlaceholder } from 'components/Filters';
import { CustomSelectProps } from './types';
import { selectStyles } from './styles';

export const Select = (props: CustomSelectProps) => {
  const { selectProps, tooltipProps = {} } = props;
  const { title, options = [], ...fixedSelectProps } = selectProps;

  // a hacky way to prevent closing the dropdown when focusing the input inside
  const [blockClose, setBlockClose] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

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
    onMenuOpen: () => setIsMenuOpen(true),
    onMenuClose: () => {
      if (!blockClose) setIsMenuOpen(false);
      else setBlockClose(false);
    },
    onClick: () => setIsMenuOpen(!isMenuOpen),
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
      <Flex column style={{ width: '100%', padding: '6px' }}>
        <Input
          prefix={<Icon type="Search" />}
          value={query}
          onChange={onFilterChange}
          onMouseDown={() => setBlockClose(true)}
          onBlur={() => setBlockClose(false)}
          onPressEnter={(e) => {
            setIsMenuOpen(false);
            e.preventDefault();
          }}
          style={{ marginBottom: '4px' }}
        />
        {menu}
      </Flex>
    ),
  };

  return (
    <FilterWrapper {...tooltipProps}>
      {/* ignore because cogs' "title" has "string" type - adjust that in cogs! */}
      {/* @ts-ignore */}
      <CogsSelect {...defaultSelectProps} {...fixedSelectProps} />
    </FilterWrapper>
  );
};
