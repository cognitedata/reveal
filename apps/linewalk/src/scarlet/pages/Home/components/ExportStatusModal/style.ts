import styled, { keyframes } from 'styled-components';
import { Modal } from '@cognite/cogs.js';

export const ExportStatusModal = styled(Modal)`
  position: fixed;
  left: 16px;
  bottom: 16px;
  margin: 0;
  padding: 20px;

  .cogs-modal-content {
    padding: 0;
  }
`;

export const Title = styled.h4<{ error: boolean }>`
  margin-bottom: 16px;
  color: ${({ error }) => (error ? '#a8361c' : 'var(--cogs-text-primary)')};
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Description = styled.p`
  margin: 0 0 12px;
  color: var(--cogs-text-secondary);

  button {
    margin-top: 8px;
  }
`;

const progressAnimation = keyframes`{
  0% {width: 5%;}
  100% {width: 95%;}
}`;

export const ProgressBar = styled.div`
  background-color: var(--cogs-greyscale-grey3);
  border-radius: 6px;
  height: 12px;
  width: 100%;
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background-color: #2c6935;
    border-radius: 6px;
    animation: ${progressAnimation} 25s cubic-bezier(0.5, 1, 0.89, 1) forwards;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;
