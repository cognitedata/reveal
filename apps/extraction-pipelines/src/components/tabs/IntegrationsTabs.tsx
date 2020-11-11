import React, { FunctionComponent } from 'react';
import { Tabs } from 'antd';
import styled from 'styled-components';
import OverviewTab from './OverviewTab';
import ExtractorDownloadsTab from './ExtractorDownloadsTab';

const { TabPane } = Tabs;

const StyledTabs = styled((props) => <Tabs {...props} />)`
  height: 100%;
  .ant-tabs-nav {
    padding: 0 1rem;
    margin-bottom: 0;
  }
  .ant-tabs-tabpane {
    display: grid;
    grid-template-columns: auto 25rem;
  }
  .ant-tabs-tab {
    &.ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: black;
      }
    }
    .ant-tabs-tab-btn {
      font-weight: 600;
    }
  }
  .ant-tabs-content {
    height: 100%;
  }
`;
const StyledTabPane = styled((props) => (
  <TabPane {...props}>{props.children}</TabPane>
))``;

interface OwnProps {}

type Props = OwnProps;

const IntegrationsTabs: FunctionComponent<Props> = () => {
  return (
    <StyledTabs className="cdf-tabs">
      <StyledTabPane tab="Overview" key="overview" className="tab-pane">
        <OverviewTab />
      </StyledTabPane>
      <StyledTabPane tab="Learning and resources" key="learning-and-resources">
        Learing and resources
      </StyledTabPane>
      <StyledTabPane tab="Extractor downloads" key="extractor-downloads">
        <ExtractorDownloadsTab />
      </StyledTabPane>
    </StyledTabs>
  );
};

export default IntegrationsTabs;
