import styled from 'styled-components/macro';

import { Variant } from '../../types';

export const TooltipWrapper = styled.div`
  position: absolute;
  transform: translateY(-50%);
  transition: opacity 0.4s ease;
  pointer-events: none;

  ${({ variant }: { variant?: Variant }) =>
    variant === 'small' &&
    `
    ${TooltipContainer} {
      padding: 4px;
      gap: 4px;
      font-size: 10px;
      line-height: 14px;
    }
    ${TooltipDetailWrapper} {
      padding: 4px;
      border-radius: 4px;
    }
  `};
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--cogs-surface--muted);
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  box-shadow: var(--cogs-elevation--surface--interactive--hover);
  border-radius: 8px;
  font-size: 12px;
  line-height: 16px;
`;

export const TooltipDetailWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 8px 12px;
  border-radius: 8px;
`;

export const TooltipDetailLabel = styled.div`
  font-weight: 500;
  margin-right: 4px;
`;

export const TooltipDetailValue = styled.div`
  font-weight: 400;
`;
