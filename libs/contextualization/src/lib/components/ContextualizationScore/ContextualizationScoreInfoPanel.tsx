import { useState, useRef, useEffect } from 'react';

import {
  ContentWrapper,
  SyntaxHelperWrapper,
} from '@data-exploration-components/components/SearchQueryInfoPanel/elements';
import { Content } from 'antd/lib/layout/layout';

import { SegmentedControl } from '@cognite/cogs.js';

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
  mappedPercentageJobStatus,
  estimatedCorrectness = '?',
  percentageFilled = '?',
  contextualizationScore = '?',
}: {
  headerName: string;
  dataModelType: string;
  mappedPercentageJobStatus: JobStatus;
  estimatedCorrectness?: string;
  percentageFilled?: string;
  contextualizationScore?: string;
}) => {
  const [currentTab, setCurrentTab] = useState<AdvancedJoinsInfoTabType>(
    'Estimated Correctness'
  );
  const [tabHeight, setTabHeight] = useState<number>();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleNavigation = (nextTab: AdvancedJoinsInfoTabType) => {
    setCurrentTab(nextTab);
  };

  // Transition the height to the height of the new tab
  useEffect(() => {
    if (contentRef.current) {
      setTabHeight(contentRef.current.offsetHeight);
    }
  }, [currentTab]);

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
      <ContentWrapper height={tabHeight}>
        <Content ref={contentRef}>
          {currentTab === 'Estimated Correctness' && (
            <ContextualizationScoreTab
              headerName={headerName}
              dataModelType={dataModelType}
              mappedPercentageJobStatus={mappedPercentageJobStatus}
              estimatedCorrectness={estimatedCorrectness}
              percentageFilled={percentageFilled}
              contextualizationScore={contextualizationScore}
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
