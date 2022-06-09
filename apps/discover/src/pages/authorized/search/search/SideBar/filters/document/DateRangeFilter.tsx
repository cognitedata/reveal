import { useSetDocumentFilters } from 'domain/savedSearches/internal/hooks/useSetDocumentFilters';

import React, { useEffect, useState, useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';
import { dateToEpoch } from 'utils/date';

import { Button, Range } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { FlexAlignItems, sizes } from 'styles/layout';

import { ClearButton } from '../../components/ClearButton';
import { CommonDateRange } from '../../components/CommonDateRange';
import { DateRangeTabs } from '../../components/DateRangeTabs';
import { Content } from '../../components/elements';
import { FilterCollapse } from '../../components/FilterCollapse';
import { DateTabType } from '../../types';
import { syncDatesWithSavedSearch } from '../dateRangeService';

const DateRangeFooterWrapper = styled(FlexAlignItems)`
  border-top: 1px solid var(--cogs-greyscale-grey3);
  justify-content: flex-end;
  padding-right: ${sizes.normal};
  padding-top: 4px;
`;

const initialDateState: Range = {};

export const DateRangeFilter: React.FC = React.memo((props) => {
  const setDocumentFilters = useSetDocumentFilters();
  const metrics = useGlobalMetrics('search');
  const appliedFilters = useFilterAppliedFilters();
  const [dateState, setDateState] = useState<Range>(initialDateState);
  const [activeKey, setActiveKey] = useState<DateTabType>('lastcreated');
  const [showApplyButton, setShowApplyButton] = useState(false);
  const filters = useMemo(() => appliedFilters.documents, [appliedFilters]);

  useEffect(() => {
    syncDatesWithSavedSearch(
      activeKey,
      dateState,
      initialDateState,
      filters,
      setDateState
    );
  }, [filters?.lastcreated, filters?.lastmodified, activeKey]);

  const handleApplyFilters = async () => {
    metrics.track('click-apply-date-range-filter');
    setShowApplyButton(false);
    search();
  };

  const handleClearDate = () => {
    setDateState(initialDateState);
    setDocumentFilters({
      ...filters,
      [activeKey]: [],
    });
  };

  const handleChangeDateRange = (newRanges: Range) => {
    setDateState(newRanges);
    if (!showApplyButton) {
      setShowApplyButton(true);
    }
  };

  const renderDateTabs = () => (
    <DateRangeTabs activeKey={activeKey} setActiveKey={setActiveKey} />
  );

  const renderClearButton = () => (
    <DateRangeFooterWrapper>
      <ClearButton
        activeKey={activeKey}
        filters={filters}
        handleClearDate={handleClearDate}
      />
      <Button
        type="primary"
        onClick={handleApplyFilters}
        disabled={isEmpty(dateState)}
      >
        Apply
      </Button>
    </DateRangeFooterWrapper>
  );

  const search = () => {
    setDocumentFilters({
      ...filters,
      [activeKey]: [
        String(dateToEpoch(dateState.startDate as Date)),
        String(dateToEpoch(dateState.endDate as Date)),
      ],
    });
  };

  return (
    <FilterCollapse.Panel
      title="Date Range"
      handleApplyClick={handleApplyFilters}
      {...props}
    >
      <Content>
        <CommonDateRange
          range={dateState}
          prependComponent={renderDateTabs}
          appendComponent={renderClearButton}
          onChange={handleChangeDateRange}
        />
      </Content>
    </FilterCollapse.Panel>
  );
});
