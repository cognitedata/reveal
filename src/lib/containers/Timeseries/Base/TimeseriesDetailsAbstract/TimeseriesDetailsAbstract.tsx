import React from 'react';
import styled from 'styled-components';
import { Timeseries } from '@cognite/sdk';
import { Icons, Title, Body, Icon, Colors } from '@cognite/cogs.js';
import {
  InfoGrid,
  InfoCell,
  LatestDatapoint,
  DetailsItem,
  SpacedRow,
} from 'lib/components';
import { useResourcesState } from 'lib/context';
import { TimeseriesChart } from 'lib/containers/Timeseries';

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
  timeSeries: Timeseries;
  extras?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  const { resourcesState } = useResourcesState();

  const currentlyViewing = resourcesState.find(
    el => el.type === 'timeSeries' && el.state === 'active'
  );
  return (
    <InfoGrid className="timeseries-info-grid" noBorders style={style}>
      {timeSeries.id === (currentlyViewing || {}).id && (
        <InfoCell
          noBorders
          containerStyles={{
            display: 'flex',
            alignItems: 'center',
            color: Colors['greyscale-grey6'].hex(),
          }}
        >
          <Body
            level={2}
            strong
            style={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Icon type="Eye" style={{ marginRight: 8 }} /> Currently viewing
            sequence
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {timeSeries.name && (
        <InfoCell noBorders noPadding>
          <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icons.Timeseries />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {timeSeries.name}
            </span>
          </Title>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <SpacedRow>{actions}</SpacedRow>
        </InfoCell>
      )}

      <LatestDatapoint timeSeries={timeSeries} />
      <InfoCell noPadding noBorders>
        <TimeseriesChart
          timeseriesId={timeSeries.id}
          height={150}
          showContextGraph={false}
          timeOptions={['1H', '1D', '1W', '1M', '1Y']}
          defaultOption="1Y"
        />
      </InfoCell>

      <InfoCell noPadding noBorders>
        <Title level={5}>Details</Title>
      </InfoCell>

      <InfoGrid noBorders>
        <DetailsItem name="Description" value={timeSeries.description} />
        <DetailsItem name="Unit" value={timeSeries.unit} />
      </InfoGrid>
      {children}
    </InfoGrid>
  );
};
