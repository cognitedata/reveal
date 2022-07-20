import React from 'react';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';
import { Row, Col, Badge } from 'antd';
import { ResourceType } from 'types';
import { ResourceFilterProps, SetResourceFilterProps } from 'CommonProps';
import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from 'components';
import { lightGrey } from 'utils/Colors';
import styled from 'styled-components';
import {
  getSelectedFilter,
  countByFilter,
  FiltersWithResourceType,
  FilterType,
} from 'utils/FilterCountUtils';

const TRANSITION_TIME = 200;
interface IFilterIcon {
  filter: FilterType;
}

export type FilterProps = Required<ResourceFilterProps> &
  SetResourceFilterProps & {
    resourceType: ResourceType;
  };

const Filters = ({
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
}: FilterProps) => {
  switch (resourceType) {
    case 'asset': {
      return <AssetFilters filter={assetFilter} setFilter={setAssetFilter} />;
    }
    case 'event': {
      return <EventFilters filter={eventFilter} setFilter={setEventFilter} />;
    }
    case 'timeSeries': {
      return (
        <TimeseriesFilters
          filter={timeseriesFilter}
          setFilter={setTimeseriesFilter}
        />
      );
    }
    case 'file': {
      return <FileFilters filter={fileFilter} setFilter={setFileFilter} />;
    }
    case 'sequence': {
      return (
        <SequenceFilters
          filter={sequenceFilter}
          setFilter={setSequenceFilter}
        />
      );
    }

    default: {
      return null;
    }
  }
};

const FilterIconWithCount = ({ filter }: IFilterIcon) => {
  const filterCount = countByFilter(filter);
  if (filterCount !== 0) {
    return (
      <Badge count={filterCount}>
        <Icon type="Configure" />
      </Badge>
    );
  }

  return <Icon type="Configure" />;
};

export const SearchFilters = ({
  visible = true,
  allowHide = true,
  closeFilters = () => {},
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
  closeFilters?: () => void;
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

  return (
    <div
      style={{
        display: 'flex',

        flexDirection: 'column',
        width: visible ? 260 : 0,
        marginLeft: 1,
        borderRight: `1px solid ${lightGrey}`,
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && (
        <>
          <HeaderRow align="middle" justify="center">
            <IconCol flex="none">
              <FilterIconWithCount filter={selectedFilter} />
            </IconCol>
            <Col flex="auto">Filters</Col>
            {allowHide && (
              <Col flex="none">
                <HideFiltersTooltip content="Hide">
                  <Button
                    icon="PanelLeft"
                    type="ghost"
                    onClick={closeFilters}
                  />
                </HideFiltersTooltip>
              </Col>
            )}
          </HeaderRow>
          <StyledFilters>
            <Filters
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

const IconCol = styled(Col)`
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px solid ${lightGrey};
`;

const HeaderRow = styled(Row)`
  padding-right: 16px;
  padding-bottom: 20px;
  margin-top: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${lightGrey};
`;

const HideFiltersTooltip = styled(Tooltip)`
  margin-bottom: 8px;
`;

const StyledFilters = styled.div`
  padding-left: 1px;
  padding-right: 16px;
  padding-bottom: 16px;
  height: 100%;
  overflow: auto;
`;
