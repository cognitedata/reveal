import React from 'react';

import noop from 'lodash/noop';

import { DropdownContextType } from './types';

export const DropdownContext = React.createContext<DropdownContextType>({
  hideOnSelect: false,
  dropdownVisible: false,
  setDropdownVisible: noop,
});

export const useDropdownContext = () => React.useContext(DropdownContext);
