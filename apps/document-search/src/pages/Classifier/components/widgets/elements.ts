import styled from 'styled-components';

import { motion } from 'framer-motion';

import { Body } from '@cognite/cogs.js';

export const StepContainer = styled(motion.div)<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive ? 'var(--cogs-greyscale-grey2)' : 'white'};
  margin-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  user-select: none;

  .cogs-body-1,
  .cogs-body-2 {
    color: var(--cogs-text-color-secondary);
  }
`;

export const StepBadge = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 0.75rem;
  box-sizing: border-box;
  padding-bottom: 1px;
`;

export const StepBadgeCount = styled(StepBadge)`
  border: 0.125rem solid var(--cogs-greyscale-grey6);
  background-color: transparent;
  color: var(--cogs-greyscale-grey6);
`;

export const StepBadgeComplete = styled(StepBadge)`
  background-color: var(--cogs-green-3);
  color: white;
`;

export const StepBadgeActive = styled(StepBadge).attrs({
  animate: { scale: 1.2 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
})`
  background-color: var(--cogs-midblue-3);
  color: white;
`;

export const StepContent = styled(motion.div).attrs((props: any) => ({
  animate: { height: props.$step ? '45px' : '25px' },
}))<{ $step: boolean }>`
  display: flex;
  flex-direction: column;
`;
export const Title = styled(Body).attrs({ level: 1 })<{ $isActive: boolean }>`
  font-weight: ${(props) => (props.$isActive ? '600' : '400')};
`;
