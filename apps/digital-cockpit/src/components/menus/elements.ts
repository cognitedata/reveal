import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const MenuContainer = styled.div`
  display: flex;
  position: relative;
`;
export const ActionsContainer = styled.div`
  position: absolute;
  top: 36px;
  left: 24px;
  color: var(--cogs-text-color);
  z-index: ${layers.TILE_ACTIONS_MENU};
  & .cogs-menu {
    padding: 0;
  }
  & .cogs-menu-item {
    padding: 0;
  }
`;
export const MenuItemContent = styled.div`
  width: inherit;
  padding: 8px;
  text-align: left;
`;
