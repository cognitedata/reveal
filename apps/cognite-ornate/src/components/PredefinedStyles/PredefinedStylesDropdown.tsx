import React from 'react';
import { Menu, Select } from '@cognite/cogs.js';
import { PREDEFINED_STYLES } from 'context';
import { PredefinedStyle } from 'context/types';

type PredefinedStylesDropdownProps = {
  predefinedStyle: PredefinedStyle;
  onChange: (style: PredefinedStyle) => void;
};

const PredefinedStylesDropdown = ({
  predefinedStyle,
  onChange,
}: PredefinedStylesDropdownProps) => {
  return (
    <>
      <Menu.Header>PREDEFINED STYLES</Menu.Header>
      <Select
        closeMenuOnSelect
        value={predefinedStyle}
        onChange={onChange}
        options={PREDEFINED_STYLES}
      />
    </>
  );
};

export default PredefinedStylesDropdown;
