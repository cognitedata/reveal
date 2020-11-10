import React from 'react';
import { ResourceType } from 'lib/types';
import { ResourceFilterProps, SetResourceFilterProps } from 'lib/CommonProps';
import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from 'lib';
import { Colors } from '@cognite/cogs.js';

const TRANSITION_TIME = 300;

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
}: { resourceType: ResourceType; visible?: boolean } & Required<
  ResourceFilterProps
> &
  SetResourceFilterProps) => {
  const Filters = () => {
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
  return (
    <div
      style={{
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        width: visible ? 260 : 0,
        marginTop: 16,
        marginLeft: 1,
        paddingRight: visible ? 16 : 0,
        marginRight: visible ? 16 : 0,
        borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease, padding-right ${TRANSITION_TIME}ms ease, margin-right ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && Filters()}
    </div>
  );
};
