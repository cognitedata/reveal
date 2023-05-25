import { Flex } from '@cognite/cogs.js';
import { zIndex } from '@data-exploration-lib/core';
import styled from 'styled-components/macro';

interface BarProps {
  visible: boolean;
}

export const Wrapper = styled.div<BarProps>`
  --cogs-text-icon--medium: var(--cogs-text-icon--medium--inverted);
  --cogs-text-icon--strong: var(--cogs-text-icon--strong--inverted);
  --cogs-surface--interactive--hover: var(
    --cogs-surface--interactive--hover--inverted
  );
  --cogs-greyscale-grey6: var(--cogs-text-icon--muted--inverted);
  .cogs-menu {
    background: var(--cogs-surface--muted--inverted);
  }

  position: absolute;
  display: flex;
  justify-content: center;
  bottom: 0;
  width: 100%;
  padding: 0;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: transform 300ms;
  transform: translateY(
    ${(props: BarProps) => (props.visible ? '0px' : '88px')}
  );
  margin: 16px auto;
  z-index: ${zIndex.BULK_ACTION};
`;

export const Bar = styled(Flex)`
  padding: 0 16px;
  width: 70%;

  justify-content: space-between;
  align-items: center;
  height: 56px;
  background: var(--cogs-surface--muted--inverted);
  border-radius: 8px;
`;

export const Subtitle = styled.div`
  color: var(--cogs-text-icon--medium--inverted);
  font-size: 12px;
  font-weight: 500;
`;

export const Title = styled.div`
  color: var(--cogs-text-icon--strong--inverted);
  font-size: 14px;
  font-weight: 500;
`;

export const Separator = styled.div`
  height: 28px;
  width: 0;
  border-left: 1px solid var(--cogs-color-strokes-default);
  margin-left: 8px;
  margin-right: 8px;
`;
