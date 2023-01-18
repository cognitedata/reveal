import { Collapse, Label } from '@cognite/cogs.js';
import styled from 'styled-components';

export const SidebarChip = styled(Label)`
  margin-left: 1em;
  font-size: 12px;
  font-weight: 500;

  &.cogs-label--variant-default {
    color: var(--cogs-text-icon--status-undefined);
    background: rgba(102, 102, 102, 0.1);
  }
`;

export const SidebarCollapseWrapped = styled(Collapse)`
  &&& {
    background-color: white;

    .rc-collapse-item {
      margin: 0 0 1rem;
      border: 0;
      .rc-collapse-header {
        background-color: #f5f5f5;
        border-radius: 4px;
        font-weight: bold;
      }
    }

    .rc-collapse-content {
      overflow: visible;
      border-radius: 0 0 0.75rem 0.75rem;
      padding-bottom: 1px;
      padding: 0;
    }

    .rc-collapse-content-box {
      margin-bottom: 15px;
    }
  }
`;
