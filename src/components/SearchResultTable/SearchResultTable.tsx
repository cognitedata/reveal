import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';
import { SearchResultLoader, Table } from '@cognite/data-exploration';
import { Asset, Timeseries } from '@cognite/sdk';
import styled from 'styled-components/macro';
import { TimeseriesResults } from 'components/SearchResultTable';

export const SearchResultTable = ({
  query,
  onTimeseriesClick,
}: {
  query: string;
  onTimeseriesClick: (timeseries: Timeseries) => void;
}) => {
  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataKey: 'name',
        width: 200,
        cellRenderer: ({ rowData }: { rowData: Asset }) => {
          return (
            <span>
              <Icon
                type="ResourceAssets"
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
      {
        key: 'preview',
        title: 'Preview',
        width: 250,
      },
      {
        key: 'unit',
        title: 'Unit',
        width: 100,
      },
      {
        key: 'actions',
        title: '',
        width: 100,
      },
    ],
    []
  );

  return (
    <SearchResultLoader type="asset" query={query}>
      {({ data = [], ...rest }: { data: Asset[] }) => (
        <Table<Asset & { children?: { content: React.ReactNode }[] }>
          data={data.map((asset: Asset) => ({
            ...asset,
            children: [
              {
                content: (
                  <TimeseriesResults
                    assetId={asset.id}
                    onTimeseriesClick={onTimeseriesClick}
                  />
                ),
              },
            ],
          }))}
          columns={columns}
          expandColumnKey="actions"
          rowRenderer={rowRenderer}
          estimatedRowHeight={50}
          fixed
          {...rest}
        />
      )}
    </SearchResultLoader>
  );
};

const rowRenderer = ({ rowData, cells }: any) => {
  if (rowData.content) {
    return <DetailRow>{rowData.content}</DetailRow>;
  }

  const newCells = cells.map((cell: JSX.Element) => {
    // Override each row's styles to set a fixed height
    const style = {
      ...cell.props.style,
      height: 50,
      alignSelf: 'flex-start',
    };
    return React.cloneElement(cell, { style });
  });

  return newCells;
};

const DetailRow = styled.div`
  height: auto;
  width: 100%;
  align-self: flex-start;
`;
