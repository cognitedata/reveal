import { useQuerySavedSearchRelatedDocuments } from 'domain/savedSearches/internal/queries/useQuerySavedSearchRelatedDocuments';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import { dateToEpoch } from 'utils/date';

import { Dropdown, Menu, Range } from '@cognite/cogs.js';

import { BaseButton } from 'components/Buttons';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { useSetRelatedDocumentFilters } from 'modules/inspectTabs/hooks/useSetRelatedDocumentFilters';
import { ClearButton } from 'pages/authorized/search/search/SideBar/components/ClearButton';
import { CommonDateRange } from 'pages/authorized/search/search/SideBar/components/CommonDateRange';
import { DateRangeTabs } from 'pages/authorized/search/search/SideBar/components/DateRangeTabs';
import { Content } from 'pages/authorized/search/search/SideBar/components/elements';
import { syncDatesWithSavedSearch } from 'pages/authorized/search/search/SideBar/filters/dateRangeService';
import { DateTabType } from 'pages/authorized/search/search/SideBar/types';

import { DateRangeButtonWrapper } from './elements';

export const RelatedDocumentDateRange: React.FC = () => {
  const { data } = useQuerySavedSearchRelatedDocuments();
  const setRelatedDocumentFilters = useSetRelatedDocumentFilters();
  const query = get(data, 'query');
  const filters = get(data, 'filters.documents.facets') as DocumentsFacets;
  const { t } = useTranslation();

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const initialDateState = {
    startDate: new Date(),
    endDate: new Date(),
  };

  const [dateState, setDateState] = useState<Range>(initialDateState);
  const [activeKey, setActiveKey] = useState<DateTabType>('lastcreated');

  const handleClick = () => {
    setShowDropdown(true);
  };

  const search = (newRanges: Range) => {
    const facets: DocumentsFacets = {
      ...filters,
      [activeKey]: [
        String(dateToEpoch(newRanges.startDate as Date)),
        String(dateToEpoch(newRanges.endDate as Date)),
      ],
    };
    setRelatedDocumentFilters(facets, query);
  };

  const applyFilters = async (newRanges: Range) => {
    await search(newRanges);
  };

  const renderDateTabs = () => (
    <DateRangeTabs activeKey={activeKey} setActiveKey={setActiveKey} />
  );

  const renderClearButton = () => (
    <ClearButton
      activeKey={activeKey}
      filters={filters}
      handleClearDate={handleClearDate}
    />
  );

  const handleClearDate = () => {
    const facets: DocumentsFacets = {
      ...filters,
      [activeKey]: [],
    };

    setRelatedDocumentFilters(facets, query);
  };

  useEffect(() => {
    syncDatesWithSavedSearch(
      activeKey,
      dateState,
      initialDateState,
      filters,
      setDateState
    );
  }, [data, filters?.lastcreated, filters?.lastmodified, activeKey]);

  return (
    <div>
      <Dropdown
        visible={showDropdown}
        onClickOutside={() => setShowDropdown(false)}
        content={
          <div>
            {showDropdown && (
              <Menu>
                <Content>
                  <CommonDateRange
                    range={dateState}
                    prependComponent={renderDateTabs}
                    appendComponent={renderClearButton}
                    onChange={applyFilters}
                    type="standard"
                    calendarHasBorder={false}
                  />
                </Content>
              </Menu>
            )}
          </div>
        }
      >
        <DateRangeButtonWrapper active={showDropdown}>
          <BaseButton
            onClick={handleClick}
            icon={showDropdown ? 'ChevronUp' : 'ChevronDown'}
            type="secondary"
            text={t('Date Range')}
            iconPlacement="right"
          />
        </DateRangeButtonWrapper>
      </Dropdown>
    </div>
  );
};
