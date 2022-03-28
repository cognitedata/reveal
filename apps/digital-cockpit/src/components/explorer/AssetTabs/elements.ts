import { Label } from '@cognite/cogs.js';
import styled from 'styled-components';

export const AssetBreadcrumbsWrapper = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-weight: 600;
  margin-bottom: 15px;
  padding: 0 24px;

  .breadcrumb-item {
    text-transform: uppercase;
  }
  .breadcrumb-divider {
    padding-left: 7px;
    padding-right: 7px;
  }
`;
export const AssetTabsWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .rc-tabs {
    height: 100%;
  }
  & .cogs-tabs {
    height: 100%;
    .rc-tabs-nav-wrap {
      border-bottom: 2px solid var(--cogs-greyscale-grey2);
      padding: 0 24px;
    }
    .rc-tabs-content {
      padding: 24px;
      height: 100%;
      overflow: auto;
    }
    .rc-tabs-content-holder {
      height: 100%;
    }
  }
`;
export const AssetTitle = styled.h2`
  font-family: Inter;
  font-size: 18px;
  line-height: 24px;
  padding: 24px 24px 0;
`;

export const CountLabel = styled(Label)`
  margin-left: 8px;
`;
