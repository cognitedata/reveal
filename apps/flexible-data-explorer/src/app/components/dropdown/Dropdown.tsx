import { ComponentProps } from 'react';

import { Dropdown as DefaultDropdown } from '@cognite/cogs.js';

export const Dropdown = (props: ComponentProps<typeof DefaultDropdown>) => {
  return <DefaultDropdown {...props} />;
};
