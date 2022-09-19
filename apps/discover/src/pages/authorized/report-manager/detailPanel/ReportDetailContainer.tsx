import * as React from 'react';

import styled from 'styled-components/macro';

import { Tabs } from '@cognite/cogs.js';

import { ReportDetailProps } from '../types';

import { ReportComments } from './ReportComments';
import { ReportDetail } from './ReportDetail';

export type ReportTabs = 'DETAILS' | 'COMMENTS';

// could not find a way to give border style to rc-tabs-nav from Tabs
const StyledTabs = styled(Tabs)`
  .rc-tabs-nav {
    border-bottom: 1px solid var(--cogs-color-strokes-default);
  }
`;

export const ReportDetailContainer = ({ reportId }: ReportDetailProps) => {
  const [activeKey, setActiveKey] = React.useState<ReportTabs>('DETAILS');

  const handleChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey as ReportTabs);
  };

  return (
    <StyledTabs
      activeKey={activeKey}
      onChange={handleChange}
      defaultActiveKey={activeKey}
    >
      <Tabs.TabPane key="DETAILS" tab="Report Detail">
        <ReportDetail reportId={reportId} />
      </Tabs.TabPane>
      <Tabs.TabPane key="COMMENTS" tab="Comments">
        <ReportComments reportId={reportId} />
      </Tabs.TabPane>
    </StyledTabs>
  );
};
