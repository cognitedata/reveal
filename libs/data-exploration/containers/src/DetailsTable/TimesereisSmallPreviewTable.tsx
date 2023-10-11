import React, { FC } from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import {
  SelectableItemsProps,
  useTranslation,
} from '@data-exploration-lib/core';
import { InternalTimeseriesData } from '@data-exploration-lib/domain-layer';

import { ResourceSelection } from '../ResourceSelector';

import { TimeseriesDetailsTable } from './TimeseriesDetailsTable';

interface Props {
  data: InternalTimeseriesData[];
  fetchMore: any;
  hasNextPage?: boolean;
  isLoading: boolean;
  enableDetailTableSelection: boolean;
  selectedRows?: ResourceSelection;
}

// TODO: Fix typo TimeseriesSmallPreviewTable
export const TimesereisSmallPreviewTable: FC<
  Props & Partial<Pick<SelectableItemsProps, 'onSelect'>>
> = ({
  data,
  fetchMore,
  hasNextPage,
  isLoading,
  enableDetailTableSelection,
  selectedRows,
  onSelect,
}) => {
  const [selected, setSelected] = React.useState<number | undefined>(undefined);
  const { t } = useTranslation();

  if (!selected) {
    return (
      <TimeseriesDetailsTable
        id="related-timeseries-asset-details"
        data={data}
        fetchMore={fetchMore}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
        enableSelection={enableDetailTableSelection}
        selectedRows={selectedRows?.timeSeries || {}}
        onRowSelection={(updater, currentTimeseries) => {
          onSelect?.(updater, currentTimeseries, 'timeSeries');
        }}
        onRowClick={(row) => {
          setSelected(row.id);
        }}
      />
    );
  }
  return (
    <>
      <Button
        onClick={() => setSelected(undefined)}
        type="ghost"
        icon="ArrowLeft"
      >
        {t('BACK_TO_TABLE', 'Back to table')}
      </Button>
      <TimeseriesWrapper>
        <TimeseriesChart
          timeseries={{ id: selected }}
          height={300}
          styles={{ width: 500 }}
        />
      </TimeseriesWrapper>
    </>
  );
};

const TimeseriesWrapper = styled.div`
  overflow: auto;
`;
