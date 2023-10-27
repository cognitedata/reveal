import * as React from 'react';

import { MenuProps } from '@cognite/cogs.js';

import { MenuWrapper } from './elements';

export const Menu: React.FC<MenuProps> = (props) => {
  return <MenuWrapper data-testid="filter-menu" {...props} />;
};
