import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StepContainer = styled.div<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive ? 'var(--cogs-greyscale-grey2)' : 'white'};
  margin-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  user-select: none;
`;

export const StepBadge = styled.div`
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

export const StepBadgeActive = styled(StepBadge)`
  background-color: var(--cogs-midblue-3);
  color: white;
`;

export const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const Title = styled(Body).attrs({ level: 1 })<{ $isActive: boolean }>`
  font-weight: ${(props) => (props.$isActive ? '600' : '400')};
`;
