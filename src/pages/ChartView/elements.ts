import styled from 'styled-components/macro';

export const Header = styled.header`
  background: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  hgroup {
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    h1,
    h4 {
      padding: 0;
      margin: 0;
      text-align: left;
    }
    h4 {
      color: var(--cogs-greyscale-grey5);
    }
  }
  .actions {
    display: flex;
    margin-right: 24px;
    .cogs-btn {
      margin-left: 8px;
    }
  }
`;

export const TopPaneWrapper = styled.div`
  flex: 1 1 0%;
  /* left side shouldn't have scrollbars at all */
  overflow: hidden;
  height: 100%;
`;

export const BottomPaneWrapper = styled.div`
  /* overflow: auto; */
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
  border-left: 1px solid var(--cogs-greyscale-grey4);
`;
