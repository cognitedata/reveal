import React, { useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { Badge } from 'antd';
import {
  ResourceType,
  ResourceFilterProps,
  SetResourceFilterProps,
} from 'types';

import {
  lightGrey,
  getSelectedFilter,
  countByFilter,
  FiltersWithResourceType,
  FilterType,
  isObjectEmpty,
} from 'utils';
import styled from 'styled-components';
import { Filters } from 'components/SearchNew/Filters';

const TRANSITION_TIME = 200;
interface IFilterIcon {
  filter: FilterType;
}

const FilterIconWithCount = ({ filter }: IFilterIcon) => {
  const filterCount = countByFilter(filter);
  if (filterCount !== 0) {
    return <Badge count={filterCount}></Badge>;
  }

  return null;
};

export enum FilterSection {
  AllFilters = 'ALL_FILTERS',
  AppliedFilters = 'APPLIED_FILTERS',
}

export const SearchFiltersNew = ({
  visible = true,
  // allowHide = true,
  resourceType,
  assetFilter,
  setAssetFilter,
  timeseriesFilter,
  setTimeseriesFilter,
  sequenceFilter,
  setSequenceFilter,
  eventFilter,
  setEventFilter,
  fileFilter,
  setFileFilter,
}: {
  resourceType: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
} & Required<ResourceFilterProps> &
  SetResourceFilterProps) => {
  const selectedFilter = getSelectedFilter({
    resourceType,
    assetFilter,
    timeseriesFilter,
    sequenceFilter,
    eventFilter,
    fileFilter,
  } as FiltersWithResourceType);

  const hasNoFiltersApplied =
    isObjectEmpty(assetFilter) &&
    isObjectEmpty(eventFilter) &&
    isObjectEmpty(timeseriesFilter) &&
    isObjectEmpty(fileFilter) &&
    isObjectEmpty(sequenceFilter);

  const [filterSection, setFilterSection] = useState<FilterSection>(
    FilterSection.AllFilters
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: visible ? 260 : 0,
        marginLeft: 1,
        borderRight: `1px solid ${lightGrey}`,
        paddingTop: '18px',
        // paddingRight: '18px',
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && (
        <>
          <ControllerContainer>
            <SegmentedControl
              fullWidth
              currentKey={filterSection}
              onButtonClicked={(key: string) => {
                setFilterSection(key as FilterSection);
              }}
            >
              <SegmentedControl.Button key={FilterSection.AllFilters}>
                All filters
              </SegmentedControl.Button>
              <SegmentedControl.Button
                key={FilterSection.AppliedFilters}
                disabled={hasNoFiltersApplied}
              >
                Applied <FilterIconWithCount filter={selectedFilter} />
              </SegmentedControl.Button>
            </SegmentedControl>
          </ControllerContainer>

          <StyledFilters>
            <Filters
              filterSection={filterSection}
              resourceType={resourceType}
              assetFilter={assetFilter}
              setAssetFilter={setAssetFilter}
              timeseriesFilter={timeseriesFilter}
              setTimeseriesFilter={setTimeseriesFilter}
              sequenceFilter={sequenceFilter}
              setSequenceFilter={setSequenceFilter}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              fileFilter={fileFilter}
              setFileFilter={setFileFilter}
            />
          </StyledFilters>
        </>
      )}
    </div>
  );
};

const StyledFilters = styled.div`
  padding-left: 1px;
  padding-right: 16px;
  padding-bottom: 16px;
  height: 100%;
  overflow: auto;
`;

const ControllerContainer = styled.div`
  padding-right: 16px;
`;
