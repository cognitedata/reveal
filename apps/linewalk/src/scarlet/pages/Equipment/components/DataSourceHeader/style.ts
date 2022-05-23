import styled from 'styled-components';
import { Icon as CogsIcon } from '@cognite/cogs.js';
import { Color } from 'scarlet/config';

export const Container = styled.div`
  display: flex;
  margin-right: 8px;
  overflow: hidden;
  flex-grow: 1;
  align-items: center;
`;

export const IconContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-right: 16px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  margin-right: 16px;
`;

export const Label = styled.div`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--cogs-text-color);
`;

export const PrimaryTag = styled.div`
  background-color: #2a7a4b;
  border-radius: 4px;
  text-transform: uppercase;
  color: var(--cogs-white);
  padding: 1px 4px;
`;

export enum IconState {
  APPROVED = 'approved',
  CRITICAL = 'critical',
  NEUTRAL = 'neutral',
  PENDING = 'pending',
}

export const Icon = styled(CogsIcon)<{ state?: IconState }>`
  color: ${({ state }) => {
    switch (state) {
      case IconState.APPROVED:
        return Color.APPROVED;
      case IconState.CRITICAL:
        return Color.CRITICAL;
      case IconState.PENDING:
        return Color.PENDING;
      default:
        return Color.NEUTRAL;
    }
  }};
`;
