import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { StyledEmptyStateContainer } from '@transformations/components/inspect-section';
import JobListItem from '@transformations/components/panels/run-history/JobListItem';
import RunHistoryTabContent from '@transformations/components/run-history-tab/RunHistoryTabContent';
import {
  ScrollState,
  useJobList,
  useScrollCallback,
} from '@transformations/hooks';
import SqlEditor from '@transformations/pages/transformation-details/SqlEditor';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import { collectPages } from '@transformations/utils';
import { Collapse } from 'antd';

import { Body, Colors, Elevations, Flex, Icon } from '@cognite/cogs.js';

import RecentRuns from './RecentRuns';

type RunHistorySectionProps = {
  transformation: TransformationRead;
};

const RunHistorySection = ({
  transformation,
}: RunHistorySectionProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    collapseRunHistoryCard,
    expandedRunHistoryCards,
    expandRunHistoryCard,
  } = useTransformationContext();

  const {
    data: jobsData,
    isFetched,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useJobList(transformation.id);

  const jobs = useMemo(() => collectPages(jobsData), [jobsData]);

  const contentRef = useRef<HTMLDivElement>(null);

  const [didScrollToTheEnd, setDidScrollToTheEnd] = useState(false);

  const handleScroll = useCallback((scrollState: ScrollState) => {
    setDidScrollToTheEnd(scrollState.verticalRatio >= 0.8);
  }, []);

  useScrollCallback(contentRef.current, handleScroll);

  const [tabViews, setTabViews] = useState<Record<string, string>>({});

  useEffect(() => {
    if (didScrollToTheEnd && !isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [didScrollToTheEnd, fetchNextPage, hasNextPage, isFetching]);

  const handleUpdateTabView = (id: number, view: string) => {
    setTabViews((prevState) => {
      const nextState = { ...prevState };
      nextState[id] = view;
      return nextState;
    });
  };

  return (
    <StyledContainer>
      {jobs.length > 0 && (
        <>
          <Body level={2} strong>
            {t('recent-runs')}
          </Body>
          <RecentRuns jobs={jobs} />
          <Body level={2} strong>
            {t('all-runs')}
          </Body>
        </>
      )}
      <StyledContent ref={contentRef}>
        {jobs.length === 0 ? (
          <StyledEmptyStateContainer>
            {isFetched ? (
              <Body level={3} style={{ color: Colors['text-icon--muted'] }}>
                {t('run-history-section-empty-state')}
              </Body>
            ) : (
              <Icon type="Loader" />
            )}
          </StyledEmptyStateContainer>
        ) : (
          jobs.map((item) => (
            <div key={item.id} id={item.id.toString()}>
              <StyledCollapse
                activeKey={
                  expandedRunHistoryCards.includes(item.id)
                    ? item.id
                    : undefined
                }
                bordered={false}
                expandIcon={({ isActive }) => (
                  <Icon type={isActive ? 'ChevronUp' : 'ChevronDown'} />
                )}
                expandIconPosition="end"
                key={item.id}
                onChange={(key) => {
                  const isExpanded = typeof key === 'string' || key.length > 0;
                  if (isExpanded) {
                    expandRunHistoryCard(item.id);
                  } else {
                    collapseRunHistoryCard(item.id);
                  }
                }}
              >
                <Collapse.Panel
                  key={item.id}
                  header={
                    <JobListItem
                      isExpanded={expandedRunHistoryCards.includes(item.id)}
                      tabView={tabViews[item.id]}
                      updateTabView={(view) =>
                        handleUpdateTabView(item.id, view)
                      }
                      job={item}
                    />
                  }
                >
                  {tabViews[item.id] === 'sql' ? (
                    <SqlEditor sql={item.query} />
                  ) : (
                    <RunHistoryTabContent
                      finishedTime={item.finishedTime}
                      jobId={item.id}
                      transformationId={transformation.id}
                    />
                  )}
                </Collapse.Panel>
              </StyledCollapse>
            </div>
          ))
        )}
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex).attrs({ direction: 'column', gap: 12 })`
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const StyledCollapse = styled(Collapse)`
  border: 1px solid ${Colors['border--interactive--disabled']};
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  :hover {
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }
`;

export default RunHistorySection;
