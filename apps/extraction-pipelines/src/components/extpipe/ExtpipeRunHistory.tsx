import React, { useEffect } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { RunChart } from '@extraction-pipelines/components/chart/RunChart';
import { RunLogsTable } from '@extraction-pipelines/components/extpipe/RunLogsTable';
import { SectionWithoutHeader } from '@extraction-pipelines/components/extpipe/Section';
import { DateRangeFilter } from '@extraction-pipelines/components/inputs/dateTime/DateRangeFilter';
import { TimeSelector } from '@extraction-pipelines/components/inputs/dateTime/TimeSelector';
import { DebouncedSearch } from '@extraction-pipelines/components/inputs/DebouncedSearch';
import {
  PageWrapperColumn,
  StyledPageContainer,
} from '@extraction-pipelines/components/styled';
import { QuickDateTimeFilters } from '@extraction-pipelines/components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from '@extraction-pipelines/components/table/StatusFilterMenu';
import {
  useSelectedExtpipe,
  useSelectedExtpipeId,
} from '@extraction-pipelines/hooks/useExtpipe';
import { trackUsage } from '@extraction-pipelines/utils/Metrics';

import { Colors, Loader } from '@cognite/cogs.js';

import ErrorFeedback from './ErrorFeedback';
import { ExtpipeHeading } from './ExtpipeHeading';

export interface RangeType {
  startDate: Date;
  endDate: Date;
}

export default function ExtpipeRunHistory() {
  const { t } = useTranslation();
  const id = useSelectedExtpipeId();
  useEffect(() => {
    trackUsage({ t: 'Extraction pipeline.Health', id });
  }, [id]);

  const { data: extpipe, isInitialLoading, error } = useSelectedExtpipe();

  if (isInitialLoading) {
    return <Loader />;
  }

  if (!extpipe || error) {
    return null;
  }

  return (
    <StyledPageContainer>
      <ExtpipeHeading />
      <PageWrapperColumn>
        <SectionWithoutHeader>
          <FilterWrapper>
            <QuickDateTimeFilters />
            <DateRangeFilter />
            <TimeSelector />
            <StatusFilterMenu />
            <DebouncedSearch
              label={t('search-err-message')}
              placeholder={t('search-err-message-placeholder')}
            />
          </FilterWrapper>
          <div style={{ margin: '1rem' }}>
            <ErrorFeedback externalId={extpipe.externalId} />
            <RunChart externalId={extpipe.externalId} />
            <RunLogsTable externalId={extpipe.externalId} />
          </div>
        </SectionWithoutHeader>
      </PageWrapperColumn>
    </StyledPageContainer>
  );
}

const FilterWrapper = styled.div`
  display: flex;
  padding: 1rem;
  > :first-child,
  > :nth-child(2) {
    margin-right: 1rem;
  }
  > :nth-child(3),
  > :nth-child(4) {
    padding-right: 1rem;
    margin-right: 1rem;
    border-right: 1px solid ${Colors['decorative--grayscale--500']};
  }
  .cogs-btn-tertiary {
    height: 100%;
    background-color: ${Colors['decorative--grayscale--white']};
    &:hover {
      border: 1px solid ${Colors['text-icon--interactive--default']};
    }
  }
  .cogs-input-container {
    flex: 1;
    .addons-input-wrapper {
      height: 100%;
      .cogs-input {
        height: 100%;
      }
    }
  }
`;
