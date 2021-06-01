import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingBoxWrapper = styled.div<{
  bgColor?: string;
  txtColor?: string;
}>`
  background-color: ${(props) =>
    props.bgColor ? props.bgColor : 'var(--cogs-greyscale-grey10)'};
  color: ${(props) =>
    props.txtColor ? props.txtColor : 'var(--cogs-greyscale-grey1)'};
  padding: 1rem 2rem;
  border-radius: 4px;
  width: auto;
  display: inline-block;

  .loading-circle {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    transform-origin: center;
    color: var(--cogs-greyscale-grey1);

    &.loading-circle--animated {
      animation: ${spin} 2s linear infinite;
    }
  }
`;

export const LoadingText = styled.div`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
`;
