import styled from 'styled-components';
import { Modal as CogsModal } from '@cognite/cogs.js';

export const Modal = styled(CogsModal)`
  max-width: 330px;
`;

export const Title = styled.div`
  color: var(--cogs-greyscale-grey9);
`;

export const Description = styled.div`
  margin: 8px 0 24px;
  color: var(--cogs-greyscale-grey7);
`;

export const Footer = styled.div`
  display: flex;
  margin: 24px -8px 0;

  > .cogs-btn {
    flex-grow: 1;
    margin: 0 8px;
  }
`;
