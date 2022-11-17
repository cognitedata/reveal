import { ComponentStory } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Table } from './Table';

export default {
  title: 'Component/Table',
  component: Table,
};

interface DataType {
  col1: string;
  col2: string;
  col3?: string;
}

const exampleDatas: DataType[] = [
  {
    col1: 'Hello',
    col2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce pellentesque, eros in condimentum accumsan, urna purus porttitor leo,uzrna purus porttitor leo, vitae accumsan risus quam vitae leo. Phasellus at dolor consequat, consectetur lorem vel, tincidunt orci. Nulla luctus elementum nisl laoreet blandit.',
  },
  {
    col1: 'whatever',
    col2: 'you want',
  },
  {
    col1: 'react-table',
    col2: 'rocks',
  },
];

const exampleColumns: ColumnDef<DataType>[] = [
  {
    header: 'Column 1',
    accessorKey: 'col1', // accessorKey is the "key" in the data
    enableHiding: false, // This will mark the component as un-hideable
  },
  {
    header: 'Column 2',
    accessorKey: 'col2',
    cell: props => {
      return <span> {props?.getValue()}</span>;
    },
  },
  {
    header: 'Column 3',
    accessorKey: 'col3',
    cell: ({ cell }) => {
      const { row } = cell;
      return (
        <span>
          {row.getAllCells()[1].getValue()} {cell.getValue()}
        </span>
      );
    },
  },
];

export const Example: ComponentStory<typeof Table> = () => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  return (
    <Table<DataType>
      id="example-table"
      data={data}
      columns={columns}
      enableColumnResizing
      enableSorting
      hiddenColumns={['col3']}
    />
  );
};
