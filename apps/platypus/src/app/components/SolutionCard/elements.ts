import styled from 'styled-components/macro';

export const StyledSolutionCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 182px;
  width: 325px;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  top: 0;
  transition: top 250ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
    background-color 400ms linear;
  transition-delay: 200ms;
  opacity: 1;

  :hover {
    background-color: var(--cogs-greyscale-grey1);
    top: -5px;
  }

  .top {
    display: flex;
    justify-content: space-between;
  }

  .delete {
    color: var(--cogs-danger);
  }

  .menuContainer {
    display: flex;
    justify-content: right;
    padding: 3px 7px;
  }

  .menu {
    &:hover {
      color: var(--cogs-primary);
    }
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
`;
