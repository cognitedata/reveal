import styled from 'styled-components/macro';

export const TreemapWrapper = styled.div`
  width: 100%;
  height: 100%;

  .rect {
    fill: var(--cogs-surface--status-neutral--muted--default);

    &:hover {
      fill: var(--cogs-surface--status-neutral--muted--hover);
    }
  }

  .title-text {
    font-size: 16px;
    font-weight: bold;
    fill: var(--cogs-text-icon--status-neutral);
  }

  .description-text {
    font-size: 14px;
    fill: var(--cogs-text-icon--status-neutral);
  }
`;
