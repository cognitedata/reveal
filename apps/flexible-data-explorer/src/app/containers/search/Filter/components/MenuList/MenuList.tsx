import * as React from 'react';

import { MenuListWrapper } from './elements';

export const MenuList: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <MenuListWrapper>{children}</MenuListWrapper>;
};
