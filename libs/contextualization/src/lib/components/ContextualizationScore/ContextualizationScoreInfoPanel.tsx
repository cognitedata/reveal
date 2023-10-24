import { useState, useRef } from 'react';

import styled from 'styled-components';

import { Content } from 'antd/lib/layout/layout';

import { SegmentedControl } from '@cognite/cogs.js';

import { SyntaxHelperWrapper } from '@data-exploration-components';

import { JobStatus } from '../../types';
import { ADVANCED_JOINS_INFO_TABS } from '../constants';
import { AdvancedJoinsInfoTabType } from '../types';

import {
  ContextualizationScoreTab,
  AdvancedJoinsDocumentationTab,
} from './tabs';

export const ContextualizationScoreInfoPanel = ({
  headerName,
  dataModelType,
  estimateQualityJobStatus,
  contextualizationScorePercent,
  estimatedCorrectnessScorePercent,
  confidencePercent,
}: {
  headerName: string;
  dataModelType: string;
  estimateQualityJobStatus: JobStatus | undefined;
  contextualizationScorePercent: number | undefined;
  estimatedCorrectnessScorePercent: number | undefined;
  confidencePercent: number | undefined;
}) => {
  const [currentTab, setCurrentTab] = useState<AdvancedJoinsInfoTabType>(
    'Estimated Correctness'
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const handleNavigation = (nextTab: AdvancedJoinsInfoTabType) => {
    setCurrentTab(nextTab);
  };

  return (
    <SyntaxHelperWrapper>
      <SegmentedControl
        fullWidth
        currentKey={currentTab}
        onButtonClicked={handleNavigation}
      >
        {ADVANCED_JOINS_INFO_TABS.map((tab) => (
          <SegmentedControl.Button key={tab}>{tab}</SegmentedControl.Button>
        ))}
      </SegmentedControl>
      <ContentWrapper>
        <Content ref={contentRef}>
          {currentTab === 'Estimated Correctness' && (
            <ContextualizationScoreTab
              headerName={headerName}
              dataModelType={dataModelType}
              estimateQualityJobStatus={estimateQualityJobStatus}
              contextualizationScorePercent={contextualizationScorePercent}
              estimatedCorrectnessScorePercent={
                estimatedCorrectnessScorePercent
              }
              confidencePercent={confidencePercent}
            />
          )}
          {currentTab === 'Documentation' && (
            <AdvancedJoinsDocumentationTab
              headerName={headerName}
              dataModelType={dataModelType}
            />
          )}
        </Content>
      </ContentWrapper>
    </SyntaxHelperWrapper>
  );
};

const ContentWrapper = styled.div`
  padding: 12px 8px 8px 8px;
`;
