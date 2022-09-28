import { Skeleton } from '@platypus-app/components/Skeleton/Skeleton';
import styled from 'styled-components';

export const StyledSkeleton = styled(Skeleton)`
  margin-top: 2px;
`;

export const TypeList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export const FilterContainer = styled.div`
  height: 56px;
  padding: 16px;
`;

export const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

export const Item = styled.div`
  display: block;
  overflow: hidden;
  min-height: 52px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease-in-out;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: var(--cogs-surface--interactive--toggled-hover);
  }
  &:active {
    background: var(--cogs-surface--interactive--toggled-pressed);
  }
  &.active {
    background: var(--cogs-surface--interactive--toggled-default);
  }

  .type-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: var(--cogs-text-primary);
  }
`;
