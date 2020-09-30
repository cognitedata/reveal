import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, ColumnShape } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { TableWrapper } from './TableWrapper';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const HighlightCell = ({ text, query }: { text?: string; query?: string }) => {
  return (
    <Body level={2} strong>
      <Highlighter
        searchWords={(query || '').split(' ')}
        textToHighlight={text || ''}
      />
    </Body>
  );
};

type AllowedId = number | string;
type Props<T> = Partial<BaseTableProps<T>> & {
  previewingIds?: AllowedId[];
  activeIds?: AllowedId[];
  disabledIds?: AllowedId[];
  query?: string;
};

export const Table = <T extends { id: AllowedId }>({
  previewingIds,
  activeIds,
  disabledIds,
  columns = [],
  query,
  ...props
}: Props<T>) => (
  <TableWrapper>
    <AutoSizer>
      {({ width, height }) => (
        <ReactBaseTable<T>
          width={width}
          height={height}
          rowClassName={({ rowData }: { rowData: T }) => {
            const extraClasses: string[] = [];
            if (previewingIds && previewingIds.some(el => el === rowData.id)) {
              extraClasses.push('previewing');
            }
            if (activeIds && activeIds.some(el => el === rowData.id)) {
              extraClasses.push('active');
            }
            if (disabledIds && disabledIds.some(el => el === rowData.id)) {
              extraClasses.push('disabled');
            }
            return `row clickable ${extraClasses.join(' ')}`;
          }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          columns={columns.map((el: ColumnShape<T>) => ({
            headerRenderer,
            resizable: true,
            cellProps: { ...el.cellProps, query },
            cellRenderer: ({ cellData }: { cellData: string }) => (
              <HighlightCell text={cellData} query={query} />
            ),
            ...el,
          }))}
        />
      )}
    </AutoSizer>
  </TableWrapper>
);

Table.HighlightCell = HighlightCell;
