import styled from 'styled-components';

export const Error = styled.div`
  background: var(--cogs-midorange-4);
  padding: 6px;
`;

export const StyledCardContainer = styled.div`
  width: 480px;
  min-height: 480px;
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
  padding-bottom: 32px;
  background: white;
  border-radius: 4px;
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
    margin-top: 32px;
  }
  .cogs-input.cogs-input-title-as-placeholder:not(:placeholder-shown)
    ~ .placeholder,
  .cogs-input.cogs-input-title-as-placeholder.placeholder-not-shown
    ~ .placeholder,
  .cogs-input.cogs-input-title-as-placeholder:focus ~ .placeholder {
    top: calc(50% - 12px / 2 - 12px);
  }
`;

export const LoaderWrapper = styled.div`
  height: 200px;
  & > .cogs-loader {
    margin-top: 30px;
  }
`;
