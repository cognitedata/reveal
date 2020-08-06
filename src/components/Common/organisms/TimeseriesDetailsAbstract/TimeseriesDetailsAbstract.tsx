import React from 'react';
import styled from 'styled-components';
import { GetTimeSeriesMetadataDTO as TimeSeries } from '@cognite/sdk/dist/src/types/types';
import { Icons } from '@cognite/cogs.js';
import {
  InfoGrid,
  InfoCell,
  LatestDatapoint,
  SmallTitle,
  DetailsItem,
} from 'components/Common';
import { TimeseriesGraph } from 'components/Common/';

export const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

export const TimeseriesDetailsAbstract = ({
  timeSeries,
  style,
  extras,
  actions,
  children,
}: {
  timeSeries: TimeSeries;
  extras?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <InfoGrid className="timeseries-info-grid" noBorders style={style}>
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {timeSeries.name && (
        <InfoCell
          noBorders
          containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icons.Timeseries />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {timeSeries.name}
            </span>
          </SmallTitle>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <div className="button-row">{actions}</div>
        </InfoCell>
      )}

      <LatestDatapoint timeSeries={timeSeries} />
      <InfoCell noPadding noBorders>
        <TimeseriesGraph timeseries={timeSeries} />
      </InfoCell>

      <InfoCell noPadding noBorders>
        <SmallTitle>Details</SmallTitle>
      </InfoCell>

      <InfoGrid noBorders>
        <DetailsItem name="Description" value={timeSeries.description} />
        <DetailsItem name="Unit" value={timeSeries.unit} />
      </InfoGrid>
      {children}
    </InfoGrid>
  );
};
