import styled from 'styled-components';
import z from 'utils/z';

export const ContextMenuWrapper = styled.div`
  position: absolute;
  z-index: ${z.OVERLAY};
  margin-top: -115px;
  .ornate-context-menu {
    border-radius: 4px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 52 px;
  }
  .cogs-menu-header {
    margin-top: unset;
  }
`;
