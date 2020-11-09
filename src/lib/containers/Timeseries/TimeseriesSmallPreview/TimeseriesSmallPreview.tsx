import React, { useMemo } from 'react';
import { Timeseries } from '@cognite/sdk';
import { Title, Body, Colors } from '@cognite/cogs.js';
import {
  ErrorFeedback,
  Loader,
  InfoGrid,
  InfoCell,
  LatestDatapoint,
  DetailsItem,
  SpacedRow,
  ResourceIcons,
} from 'lib/components';
import { useResourceActionsContext } from 'lib/context';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { SmallPreviewProps } from 'lib/CommonProps';

export const TimeseriesSmallPreview = ({
  timeseriesId,
  actions: propActions,
  extras,
  children,
  statusText,
}: {
  timeseriesId: number;
} & SmallPreviewProps) => {
  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  const renderResourceActions = useResourceActionsContext();

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: timeseriesId,
        type: 'timeSeries',
      })
    );
    return items;
  }, [renderResourceActions, timeseriesId, propActions]);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Time series {timeseriesId} not found!</>;
  }

  return (
    <InfoGrid className="timeseries-info-grid" noBorders>
      {statusText && (
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
            {statusText}
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {timeseries.name && (
        <InfoCell noBorders noPadding>
          <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
            <ResourceIcons.Timeseries />
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {timeseries.name}
            </span>
          </Title>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <SpacedRow>{actions}</SpacedRow>
        </InfoCell>
      )}

      <LatestDatapoint timeSeries={timeseries} />
      <InfoCell
        noPadding
        noBorders
        containerStyles={{
          overflow: 'visible',
        }}
      >
        <TimeseriesChart
          timeseriesId={timeseries.id}
          height={150}
          numberOfPoints={300}
          showContextGraph={false}
          timeOptions={['1H', '1D', '1W', '1M', '1Y']}
          defaultOption="1Y"
        />
      </InfoCell>

      <InfoCell noPadding noBorders>
        <Title level={5}>Details</Title>
      </InfoCell>

      <InfoGrid noBorders>
        <DetailsItem name="Description" value={timeseries.description} />
        <DetailsItem name="Unit" value={timeseries.unit} />
      </InfoGrid>
      {children}
    </InfoGrid>
  );
};
