import { Menu } from '@cognite/cogs.js';

export const MenuItemOpenInCharts = ({ onClick }: { onClick: () => void }) => {
  return <Menu.Item onClick={onClick}>Charts</Menu.Item>;
};
