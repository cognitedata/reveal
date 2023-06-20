import { Menu } from '@cognite/cogs.js';

export const MenuItemOpenInCanvas = ({ onClick }: { onClick: () => void }) => {
  return <Menu.Item onClick={onClick}>Canvas</Menu.Item>;
};
