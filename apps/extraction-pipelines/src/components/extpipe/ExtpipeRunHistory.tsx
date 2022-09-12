import React, { useEffect } from 'react';
import styled from 'styled-components';

import { RunLogsTable } from 'components/extpipe/RunLogsTable';
import ErrorFeedback from './ErrorFeedback';
import { PageWrapperColumn } from 'components/styled';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import { Colors, Loader } from '@cognite/cogs.js';
import { TimeSelector } from 'components/inputs/dateTime/TimeSelector';
import { QuickDateTimeFilters } from 'components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';

import { RunChart } from 'components/chart/RunChart';

import { SectionWithoutHeader } from 'components/extpipe/Section';
import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import { useSelectedExtpipe, useSelectedExtpipeId } from 'hooks/useExtpipe';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
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

  const { data: extpipe, isLoading, error } = useSelectedExtpipe();

  if (isLoading) {
    return <Loader />;
  }

  if (!extpipe || error) {
    return null;
  }

  return (
    <>
      <ExtpipeBreadcrumbs extpipe={extpipe} />
      <ExtpipeHeading />

      <PageWrapperColumn style={{ marginTop: '1rem' }}>
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
    </>
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
    border-right: 1px solid ${Colors['greyscale-grey5'].hex()};
  }
  .cogs-btn-tertiary {
    height: 100%;
    background-color: ${Colors.white.hex()};
    &:hover {
      border: 1px solid ${Colors.primary.hex()};
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
