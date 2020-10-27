import React, { FunctionComponent } from 'react';
import { Tabs } from 'antd';

import styled from 'styled-components';

const { TabPane } = Tabs;

const StyledTabs = styled((props) => <Tabs {...props} />)`
  .ant-tabs-nav {
    padding: 0 1rem;
  }
  .ant-tabs-tabpane {
    padding: 0 1rem;
  }
  .ant-tabs-tab.ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: black;
    }
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
        Integrations
      </StyledTabPane>
      <StyledTabPane tab="Learning and resources" key="create-db">
        Learing and resources
      </StyledTabPane>
    </StyledTabs>
  );
};

export default IntegrationsTabs;
