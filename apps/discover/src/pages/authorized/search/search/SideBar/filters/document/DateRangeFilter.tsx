import React, { useEffect, useState, useMemo } from 'react';

import styled from 'styled-components/macro';

import { Button, Range } from '@cognite/cogs.js';

import { dateToEpoch, ifRangeIsSameTimeModifyToDayRange } from '_helpers/date';
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
  const setDocumentFilters = useSetDocumentFilters();
  const metrics = useGlobalMetrics('search');
  const appliedFilters = useFilterAppliedFilters();
  const filters = useMemo(() => appliedFilters.documents, [appliedFilters]);

  const initialDateState: Range = {
    startDate: new Date(),
    endDate: new Date(),
  };

  const [dateState, setDateState] = useState<Range>(initialDateState);

  const [activeKey, setActiveKey] = useState<DateTabType>('lastcreated');
  const [showApplyButton, setShowApplyButton] = useState(false);

  useEffect(() => {
    syncDatesWithSavedSearch(
      activeKey,
      dateState,
      initialDateState,
      filters,
      setDateState
    );
  }, [filters?.lastcreated, filters?.lastmodified, activeKey]);

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

  return (
    <FilterCollapse.Panel
      title="Date Range"
      // showApplyButton={showApplyButton}
      handleApplyClick={handleApplyFilters}
      {...props}
    >
      <Content>
        <CommonDateRange
          range={dateState}
          prependComponent={renderDateTabs}
          appendComponent={renderClearButton}
          onChange={(newRanges) => {
            setDateState(newRanges);
            if (!showApplyButton) {
              setShowApplyButton(true);
            }
          }}
        />
      </Content>
    </FilterCollapse.Panel>
  );
});
