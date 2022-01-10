import React, { useEffect, useState, useMemo } from 'react';

import styled from 'styled-components/macro';
import { dateToEpoch, ifRangeIsSameTimeModifyToDayRange } from 'utils/date';

import { Button, Range } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useSetDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
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

export const DateRangeFilter: React.FC = React.memo((props) => {
  const initialDateState: Range = {
    startDate: new Date(),
    endDate: new Date(),
  };
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

      <Button type="primary" onClick={handleApplyFilters}>
        Apply
      </Button>
    </DateRangeFooterWrapper>
  );

  const handleClearDate = () => {
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

  const rangePicker = useMemo(
    () => (
      <CommonDateRange
        range={dateState}
        prependComponent={renderDateTabs}
        appendComponent={renderClearButton}
        onChange={handleChangeDateRange}
      />
    ),
    [dateState, renderDateTabs, renderClearButton, handleChangeDateRange]
  );

  const search = () => {
    const [startDate, endDate] = ifRangeIsSameTimeModifyToDayRange(dateState);
    setDocumentFilters({
      ...filters,
      [activeKey]: [`${dateToEpoch(startDate)}`, `${dateToEpoch(endDate)}`],
    });
  };

  const handleApplyFilters = async () => {
    metrics.track('click-apply-date-range-filter');
    setShowApplyButton(false);
    search();
  };

  return (
    <FilterCollapse.Panel
      title="Date Range"
      // showApplyButton={showApplyButton}
      handleApplyClick={handleApplyFilters}
      {...props}
    >
      <Content>{rangePicker}</Content>
    </FilterCollapse.Panel>
  );
});
