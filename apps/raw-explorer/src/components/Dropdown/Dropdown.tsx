import React from 'react';

import {
  Dropdown as CogsDropdown,
  DropdownProps as CogsDropdownProps,
} from '@cognite/cogs.js';

import { ZIndexLayer } from 'utils/zIndex';
import { getContainer } from 'utils/utils';

type DropdownProps = CogsDropdownProps;

const Dropdown = (props: DropdownProps): JSX.Element => {
  return (
    <CogsDropdown
      appendTo={getContainer()}
      zIndex={ZIndexLayer.Dropdown}
      {...props}
    />
  );
};

export default Dropdown;
