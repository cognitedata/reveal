import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const TreemapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .rect {
    background: var(--cogs-surface--status-neutral--muted--default);
    border-radius: 4px;
    overflow: hidden;

    &:hover {
      background: var(--cogs-surface--status-neutral--muted--hover);
    }
  }

  .title-text {
    font-size: 16px;
    font-weight: bold;
    color: var(--cogs-text-icon--status-neutral);
    padding-top: ${sizes.normal};
    padding-left: ${sizes.normal};
    margin-bottom: ${sizes.extraSmall} !important;
    line-height: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .description-text {
    font-size: 14px;
    color: var(--cogs-text-icon--status-neutral);
    padding-left: ${sizes.normal};
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
