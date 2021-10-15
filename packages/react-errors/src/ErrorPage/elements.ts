import styled from 'styled-components';

export const ErrorPageContainer = styled.div`
  color: var(--cogs-greyscale-grey5);
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  height: 100%;
  padding: 10vw;

  header {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 24px;
  }

  p {
    font-size: 24px;
  }

  button {
    font-size: inherit;
  }
`;
