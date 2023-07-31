import styled, { css } from 'styled-components';
import { Modal as CogsModal } from '@cognite/cogs.js';

export const Footer = styled.div`
  display: flex;
  margin: 24px -8px 0;

  > .cogs-btn {
    margin: 0 8px;
  }
`;

export const Modal = styled(CogsModal)<{ isPrompt: boolean }>`
  max-width: calc(100vw - 20px);

  && {
    margin: 0px auto;
    top: 50%;
    transform: translate(0, -50%);
    max-height: 100%;
    overflow-y: scroll;
  }

  ${({ isPrompt }) =>
    isPrompt
      ? css`
          ${Footer} {
            > .cogs-btn {
              flex-grow: 1;
            }
          }
        `
      : css`
          ${Footer} {
            justify-content: flex-end;

            .cogs-btn {
              min-width: 150px;
            }
          }
        `}
`;

export const Title = styled.div`
  > span {
    color: var(--cogs-greyscale-grey9);
  }
`;

export const Description = styled.div`
  margin: 8px 0 24px;
  color: var(--cogs-greyscale-grey7);
`;

export const SecondaryButtonContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
`;
