import React from 'react';

import styled from 'styled-components';

import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from '../../components';
import {
  OldResourceFilterProps,
  ResourceType,
  SetOldResourceFilterProps,
} from '../../types';
import { lightGrey } from '../../utils';

const TRANSITION_TIME = 200;
export type FilterProps = Required<OldResourceFilterProps> &
  SetOldResourceFilterProps & {
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

export const SearchFilters = ({
  visible = true,
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
} & Required<OldResourceFilterProps> &
  SetOldResourceFilterProps) => {
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

const StyledFilters = styled.div`
  padding-left: 1px;
  padding-bottom: 16px;
  height: 100%;
  overflow: auto;
`;
