import React from 'react';

import { Loader } from '@data-exploration/components';
import noop from 'lodash/noop';

import { Title, Body } from '@cognite/cogs.js';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  DetailsItem,
  ErrorFeedback,
  InfoCell,
  InfoGrid,
  LatestDatapoint,
  ResourceIcons,
  SpacedRow,
} from '../../../components';
import { useSelectionButton } from '../../../hooks';
import { SelectableItemProps, SmallPreviewProps } from '../../../types';
import { TimeseriesChart } from '../TimeseriesChart/TimeseriesChart';
import { TimeOptions } from '../types';

export const TimeseriesSmallPreview = ({
  timeseriesId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = noop,
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
    return <ErrorFeedback error={error as CogniteError} />;
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
            color: 'var(--cogs-text-icon--medium)',
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
          disableStep
          timeseriesId={timeseries.id}
          height={150}
          numberOfPoints={300}
          showContextGraph={false}
          timeOptions={[
            TimeOptions['1H'],
            TimeOptions['1D'],
            TimeOptions['1W'],
            TimeOptions['1M'],
            TimeOptions['1Y'],
          ]}
          defaultOption={TimeOptions['1Y']}
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
