import { Modal } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledModal = styled(Modal)`
  width: 500px !important;
  padding: 10px;
  border-radius: 12px;

  .title {
    display: flex;
    border-bottom: solid 1px var(--cogs-greyscale-grey3);
    padding-bottom: 15px;
    margin-bottom: 20px;
  }

  .buttons {
    display: flex;
    justify-content: right;
    border-top: solid 1px var(--cogs-greyscale-grey3);
    padding-top: 15px;
    margin-top: 20px;
  }

  .cogs-modal-close {
    top: 25px;
    right: 20px;
    transition: all 300ms linear;
    color: var(--cogs-greyscale-grey6);

    :hover {
      color: var(--cogs-greyscale-grey7);
      cursor: pointer;
      animation: hover 500ms 1;
      transform: scale(1.25);
    }

    @keyframes hover {
      0% {
        transform: scale(1);
      }
      20% {
        transform: scale(1.5);
      }
      40% {
        transform: scale(1.25);
      }
    }
  }
`;
