import * as React from 'react';

import { MenuWrapper } from './elements';

export const Menu: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <MenuWrapper>{children}</MenuWrapper>;
};
