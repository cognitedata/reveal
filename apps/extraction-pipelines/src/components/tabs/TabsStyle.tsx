import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const StyledTabs = styled((props) => <Tabs {...props} />)`
  height: 100%;

  .ant-tabs-nav {
    padding: 0 1rem 0 1.3125rem;
    margin-bottom: 0;
  }
  .ant-tabs-tabpane {
    display: grid;
    grid-template-columns: auto 25rem;
  }
  .ant-tabs-tab {
    padding: 0.625rem 1rem;
    margin: 0;
    .ant-tabs-tab-btn {
      color: #333;
      font-weight: 600;
      line-height: 1.25rem;
    }
  }
  .ant-tabs-content {
    height: 100%;
  }
`;

const StyledSidePanelTabs = styled(StyledTabs)`
  .ant-tabs-tabpane {
    grid-template-columns: auto;
    padding: 0 1.25rem 0 1.375rem;
  }
`;

const StyledTabPane = styled((props) => (
  <TabPane {...props}>{props.children}</TabPane>
))``;

export { StyledTabs, StyledSidePanelTabs, StyledTabPane };
