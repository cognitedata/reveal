import styled from 'styled-components';

export const StyledLoginTip = styled.div`
  display: flex;
  justify-content: center;
  background-color: var(--cogs-greyscale-grey1);
  padding: 16px 0;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  .login-tip-wrapper {
    display: flex;
    max-width: 200px;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    line-height: 20px;
  }
  .separator {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--cogs-greyscale-grey5);
  }
  .external-link {
    display: flex;
    align-items: center;
    color: var(--cogs-text-color);
    span {
      margin-right: 6px;
    }
  }
`;
