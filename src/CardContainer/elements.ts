import styled from 'styled-components';

export const StyledCardContainer = styled.div`
  width: 480px;
  max-width: 100%;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 16.8443px 50.5328px rgba(0, 0, 0, 0.1),
    0px 13.4754px 20.2131px rgba(0, 0, 0, 0.07);
  transition: height 0.3s linear;
`;

export const StyledContentWrapper = styled.div`
  padding: 0 32px;
  button {
    width: 100%;
    height: 40px;
  }

  .cogs-input-container {
    width: 100%;
    margin: 0px 0px 16px;
    .input-wrapper,
    .cogs-input {
      width: 100%;
    }
  }

  .content {
    margin-top: 60px;
  }
`;
