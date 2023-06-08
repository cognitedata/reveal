import React from 'react';

import { getContainer } from '@raw-explorer/utils/utils';
import { ZIndexLayer } from '@raw-explorer/utils/zIndex';

import {
  Dropdown as CogsDropdown,
  DropdownProps as CogsDropdownProps,
} from '@cognite/cogs.js';

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
