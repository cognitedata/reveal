import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { Row, Col, Button } from 'antd';
import { ResourceType } from 'lib/types';
import { ResourceFilterProps, SetResourceFilterProps } from 'lib/CommonProps';
import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from 'lib';
import { lightGrey } from 'lib/utils/Colors';
import styled from 'styled-components';

const TRANSITION_TIME = 300;

export const SearchFilters = ({
  visible = true,
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
  closeFilters?: () => void;
} & Required<ResourceFilterProps> &
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
        borderRight: `1px solid ${lightGrey}`,
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease, padding-right ${TRANSITION_TIME}ms ease, margin-right ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && (
        <>
          <HeaderRow align="middle" justify="center">
            <IconCol flex="none">
              <Icon type="Filter" />
            </IconCol>
            <Col flex="auto">Filters</Col>
            <Col flex="none">
              <Button onClick={closeFilters}>Hide filters</Button>
            </Col>
          </HeaderRow>
          <Filters />
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
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${lightGrey};
`;
