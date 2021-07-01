import styled from 'styled-components';
import { Button, Body } from '@cognite/cogs.js';
import { NavLink } from 'react-router-dom';

import type { ExpandedItemProps } from './types';

export const TableActionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ActionWrapper = styled.div`
  display: inline-block;
  margin-right: 3rem;

  &:last-of-type {
    margin-right: 0;
  }
`;

export const PlayStopButton = styled(Button)`
  border: 2px solid var(--cogs-greyscale-grey5);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  color: var(--cogs-greyscale-grey5);

  &:hover {
    border: 2px solid;
    display: flex;
  }
`;

export const RestartButton = styled(PlayStopButton)`
  border: none;
  &:hover {
    border: none;
  }
`;
export const LinkButton = styled(NavLink)`
  color: var(--cogs-greyscale-grey5);

  &:hover {
    color: var(--cogs-greyscale-grey9);
  }

  .cogs-icon-Link {
    margin-top: 6px;
  }
`;

export const ExpandedRow = styled.div`
  padding-left: 2rem;
  padding-right: 2rem;
  display: flex;
  width: 100%;
  gap: 3rem;

  & > *:first-child {
    min-width: 250px;
  }
`;

export const ExpandedItem = styled.div<ExpandedItemProps>`
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  flex-direction: ${(props) => (props.column ? 'column' : 'row')};
  gap: 5px;

  flex: 0 1 auto;
`;

export const ExpandedItemLabel = styled.div`
  font-weight: 500;
`;

export const ExpandedItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

export const ExpandedItemContent = styled(Body).attrs(() => ({ level: 3 }))``;
