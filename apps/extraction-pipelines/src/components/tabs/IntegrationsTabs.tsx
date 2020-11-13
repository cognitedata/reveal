import React, { FunctionComponent } from 'react';
import OverviewTab from './OverviewTab';
import ExtractorDownloadsTab from './ExtractorDownloadsTab';
import { StyledTabs, StyledTabPane } from './TabsStyle';

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
