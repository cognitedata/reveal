import { Modal } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledModal = styled(Modal)<{ modalWidth?: string }>`
  width: ${(props) => props.modalWidth || '500px'} !important;
  padding: 10px;
  border-radius: 12px;

  .title {
    display: flex;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  .buttons {
    display: flex;
    justify-content: right;
    padding-top: 15px;
    margin-top: 15px;
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
  .cogs-modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;
