import styled from 'styled-components';

const maxZIndex = 9999;

export const ContextMenuWrapper = styled.div`
  position: absolute;
  z-index: ${maxZIndex};
  margin-top: -115px;
  top: 0;
  left: 0;
  .ornate-context-menu {
    border-radius: 4px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: unset;

    .cogs-btn {
      border-radius: unset;
      border-left: 1px var(--cogs-greyscale-grey3) solid;
    }
  }

  .cogs-menu-header {
    margin-top: unset;
  }
`;
