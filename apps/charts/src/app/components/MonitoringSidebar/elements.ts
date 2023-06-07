import styled from 'styled-components';

import {
  Button,
  Collapse,
  Icon,
  Label,
  Flex,
  Title,
  Body,
} from '@cognite/cogs.js';

export const SidebarChip = styled(Label)`
  margin-left: 1em;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  height: 20px;
  padding: 2px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  &.cogs-label--variant-default {
    color: var(--cogs-text-icon--status-undefined);
    background: rgba(102, 102, 102, 0.1);
  }
  &&& {
    .cogs-label--icon {
      margin-right: 0px;
    }
  }
`;

export const SidebarCollapseWrapped = styled(Collapse)`
  &&& {
    background-color: white;

    .rc-collapse-item {
      margin: 0 0 4px;
      border: 0;
      .rc-collapse-header {
        position: relative;
        background-color: #f5f5f5;
        border-radius: 4px;
        i.cogs-icon-ChevronDownSmall {
          position: absolute;
          right: 10px;
        }
      }
    }

    .rc-collapse-content {
      overflow: visible;
      border-radius: 0 0 0.75rem 0.75rem;
      padding-bottom: 1px;
      padding: 0;
    }

    .rc-collapse-content-box {
      margin-top: 4px;
      margin-bottom: 16px;
    }
  }
`;

export const ExpandTitle = styled(Body)`
  line-height: 20px;
`;

export const FormTitle = styled.h2`
  &&& {
    font-size: 18px;
    font-weight: 600;
    margin-top: 1em;
  }
`;

export const NotificationBox = styled.div`
  &&& {
    margin: 0.8em 0em;
  }
`;

export const NotificationEmail = styled.span`
  &&& {
    font-weight: 600;
  }
`;

export const FullWidthButton = styled(Button)`
  &&& {
    width: 100%;
  }
`;

export const Step3Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  position: relative;
  top: -3em;
  background: white;
`;
export const Step3IconContainer = styled.div`
  text-align: center;
  width: 200px;
  height: 100px;
`;

export const SubscriptionLoader = styled(Icon)`
  position: relative;
  top: 4px;
  left: 4px;
`;

export const EmptyStateContainer = styled(Flex)`
  /* create button & show filter select with margins */
  height: calc(100% - 92px);
`;

export const EmptyStateTitle = styled(Title)`
  margin-top: 20px;
  text-align: center;
`;

// no body level has this configuration
export const EmptyStateBody = styled(Body)`
  margin-top: 8px;
  text-align: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;
