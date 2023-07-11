import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;

  :hover {
    background: var(--cogs-surface--interactive--hover);
  }
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: auto;
  gap: 4px;
  width: ${({ width }: { width: number }) => width}px;
`;

export const Title = styled.span`
  color: var(--cogs-text-icon--medium);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'cv05' on;
`;

export const Subtitle = styled.span`
  color: var(--cogs-text-icon--muted);
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  font-feature-settings: 'ss04' on;
`;

export const SubtitleTooltipWrapper = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SubtitleTooltip = styled(Tooltip)`
  width: 224px;
  margin-left: ${({ left }: { left?: number }) => left}px;
`;
