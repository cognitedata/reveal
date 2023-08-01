import { ComponentProps } from 'react';

import { Menu as DefaultMenu } from '@cognite/cogs.js';

import { MenuItemOpenInCanvas } from './MenuItemOpenInCanvas';
import { MenuItemOpenInCharts } from './MenuItemOpenInCharts';

export const Menu = (props: ComponentProps<typeof DefaultMenu>) => {
  return <DefaultMenu {...props} />;
};

Menu.OpenInCanvas = MenuItemOpenInCanvas;
Menu.OpenInCharts = MenuItemOpenInCharts;
Menu.Header = DefaultMenu.Header;
