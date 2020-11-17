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
    grid-template-columns: ${(props) =>
      props.sidePanelTabs ? 'auto' : 'auto 25rem'};
    padding: ${(props) => (props.sidePanelTabs ? '0 1.25rem 0 1.375rem' : '0')};
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

const StyledTabPane = styled((props) => (
  <TabPane {...props}>{props.children}</TabPane>
))``;

export { StyledTabs, StyledTabPane };
