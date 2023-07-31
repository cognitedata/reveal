import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const MenuContainer = styled.div`
  display: flex;
  position: relative;
  padding: 10px;
  & .cogs-icon {
    display: flex;
    color: var(--cogs-text-color);
  }
`;
export const ActionsContainer = styled.div`
  color: var(--cogs-text-color);
  z-index: ${layers.TILE_ACTIONS_MENU};
  & .cogs-menu {
    padding: 0;
  }
  & .cogs-menu-item {
    padding: 0;
    &:hover {
      background-color: rgba(74, 103, 251, 0.05);
    }
  }
`;
export const SuiteActionsContainer = styled(ActionsContainer)`
  position: absolute;
  top: 36px;
  left: 24px;
  button {
    margin-left: 0;
  }
`;
export const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  width: inherit;
  padding: 8px;
  margin: 0 12px 0 8px;
  text-align: left;

  &.share-action {
    border-bottom: 1px solid #dcdcdc;
    padding: 16px 8px;
  }
`;
