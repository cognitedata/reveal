import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
  min-height: 36px;

  :hover {
    background: var(--cogs-surface--interactive--hover);
  }
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: auto;
  width: ${({ width }: { width: number }) => width - 8}px;
`;

export const Title = styled.div`
  color: var(--cogs-text-icon--medium);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'cv05' on;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const StyledIcon = styled(Icon)`
  min-width: 0;
`;
