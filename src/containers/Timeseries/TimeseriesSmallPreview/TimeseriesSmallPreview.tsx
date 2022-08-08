import React from 'react';
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
} from 'components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { TimeseriesChart } from 'containers/Timeseries';
import { SmallPreviewProps, SelectableItemProps } from 'types';
import { useSelectionButton } from 'hooks/useSelection';

export const TimeseriesSmallPreview = ({
  timeseriesId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = () => {},
  hideTitle = false,
}: {
  timeseriesId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const {
    data: timeseries,
    isFetched,
    error,
  } = useCdfItem<Timeseries>('timeseries', { id: timeseriesId });

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'timeSeries', id: timeseriesId },
    isSelected,
    onSelect
  );

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
      {!hideTitle && timeseries.name && (
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

      <InfoCell noBorders>
        <SpacedRow>
          {selectionButton}
          {actions}
        </SpacedRow>
      </InfoCell>

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
