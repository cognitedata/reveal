import styled from 'styled-components';

import { Flex, zIndex } from '@data-exploration-lib/core';

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
    color: var(--cogs-text-icon--on-contrast--strong);
  }

  .cogs-menu-header {
    color: var(--cogs-text-icon--on-contrast--strong);
  }
  .cogs-menu-item:hover {
    color: var(--cogs-text-icon--on-contrast--strong);
  }

  position: absolute;
  display: flex;
  justify-content: center;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 30px;
  padding: 0;
  transition: opacity 300ms, visibility 300ms;
  opacity: ${(props: BarProps) => (props.visible ? '1' : '0')};
  visibility: ${(props: BarProps) => (props.visible ? 'visible' : 'hidden')};
  z-index: ${zIndex.BULK_ACTION};
`;

export const Bar = styled(Flex)`
  padding: 0 16px;
  width: 450px;

  justify-content: space-between;
  align-items: center;
  height: 56px;
  background: var(--cogs-surface--muted--inverted);
  border-radius: 8px;
`;

export const Title = styled.div`
  color: var(--cogs-text-icon--strong--inverted);
  font-size: 14px;
  font-weight: 500;
`;

export const Subtitle = styled.div`
  color: var(--cogs-text-icon--medium--inverted);
  font-size: 12px;
  font-weight: 500;
`;

export const Separator = styled.div`
  height: 28px;
  width: 0;
  border-left: 1px solid var(--cogs-color-strokes-default);
  margin-left: 8px;
  margin-right: 8px;
`;
