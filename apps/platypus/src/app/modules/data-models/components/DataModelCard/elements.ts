import styled from 'styled-components/macro';

export const StyledDeleteMenuItem = styled.span`
  color: var(--cogs-text-icon--status-critical);
`;

export const StyledDataModelCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 182px;
  width: 320px;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  top: 0;
  transition: background-color 100ms linear;
  opacity: 1;

  :hover {
    box-shadow: var(--cogs-z-8);
  }

  :active {
    background-color: var(--cogs-surface--interactive--pressed);
  }

  .top {
    display: flex;
    justify-content: space-between;
  }

  .delete {
    color: var(--cogs-text-icon--status-critical);
  }

  .menuContainer {
    display: flex;
    justify-content: right;
  }

  .version {
    margin-left: 8px;
    display: inline-block;
    display: flex;
    align-content: center;
  }

  .title {
    display: flex;
  }

  .avatar {
    display: inline-flex;
    background: var(--cogs-black) !important;
  }

  .owners {
    opacity: 0.45;
  }
`;
