import { Icon } from '@cognite/cogs.js';
import { Table, TimeseriesChart } from '@cognite/data-exploration';
import { Timeseries } from '@cognite/sdk';
import { useSearch } from '@cognite/sdk-react-query-hooks';
import React, { useMemo } from 'react';
import styled from 'styled-components/macro';
import moment from 'moment';

export const TimeseriesResults = ({
  assetId,
  query = '',
  onTimeseriesClick,
}: {
  assetId: number;
  query?: string;
  onTimeseriesClick: (timeseries: Timeseries) => void;
}) => {
  const filter = { assetSubtreeIds: [{ id: assetId }], isString: false };
  const { data, isFetched } = useSearch('timeseries', query, {
    filter,
  });

  const sparklineStartDate = moment()
    .subtract(1, 'years')
    .startOf('seconds')
    .toDate();

  const sparklineEndDate = moment().startOf('seconds').toDate();

  const sparkLineColumn = {
    title: 'Preview',
    key: 'preview',
    width: 250,
    startTime: sparklineStartDate.valueOf(),
    endTime: sparklineEndDate.valueOf(),
    cellRenderer: ({ rowData: timeseries }: { rowData: Timeseries }) => {
      return (
        <TimeseriesChart
          height={65}
          showSmallerTicks
          timeseriesId={timeseries.id}
          numberOfPoints={100}
          showAxis="horizontal"
          timeOptions={[]}
          showContextGraph={false}
          showPoints={false}
          enableTooltip={false}
          showGridLine="none"
          minRowTicks={2}
          dateRange={[sparklineStartDate, sparklineEndDate]}
        />
      );
    },
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataKey: 'name',
        width: 200,
        cellRenderer: ({ rowData }: { rowData: Timeseries }) => {
          return (
            <span style={{ marginLeft: 20 }}>
              <Icon
                type="ResourceTimeseries"
                style={{ marginRight: 5, verticalAlign: 'text-top' }}
              />
              {rowData.name}
            </span>
          );
        },
      },
      {
        key: 'description',
        title: 'Description',
        dataKey: 'description',
        width: 300,
      },
      sparkLineColumn,
      {
        key: 'unit',
        title: 'Unit',
        dataKey: 'unit',
        width: 100,
      },
      {
        key: 'actions',
        title: '',
        width: 100,
        cellRenderer: ({ rowData }: { rowData: Timeseries }) => {
          return (
            <span>
              <Icon
                type="PlusLarge"
                onClick={() => onTimeseriesClick(rowData)}
              />
            </span>
          );
        },
      },
    ],
    []
  );

  const renderTable = () => {
    if (!data || data.length === 0) {
      return <h3>No time series found!</h3>;
    }

    return (
      <Table<Timeseries>
        data={data}
        columns={columns}
        headerHeight={0}
        rowHeight={60}
        fixed
      />
    );
  };

  return (
    <TableWrapper>
      {!isFetched && <Icon type="Loading" />}
      {isFetched && renderTable()}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  height: 240px;
  width: 100%;
`;
