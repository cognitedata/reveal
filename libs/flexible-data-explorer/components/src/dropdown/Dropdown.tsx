import { ComponentProps } from 'react';

import { Dropdown as DefaultDropdown } from '@cognite/cogs.js';

import { OpenInDropdown } from './OpenInDropdown';

export const Dropdown = (props: ComponentProps<typeof DefaultDropdown>) => {
  return <DefaultDropdown {...props} />;
};

Dropdown.OpenIn = OpenInDropdown;
