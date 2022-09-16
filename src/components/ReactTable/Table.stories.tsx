import React, { useMemo, useState } from 'react';
import { ComponentStory } from '@storybook/react';
import styled from 'styled-components';
import { Column, SortingRule } from 'react-table';
import { userEvent, within, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { NewTable as Table } from './Table';
import { Flex } from '@cognite/cogs.js';

export default {
  title: 'Component/NewTable',
  component: Table,
};

const exampleDatas: DataType[] = [
  {
    col1: 'Hello',
    col2: 'World',
  },
  {
    col1: 'react-table',
    col2: 'rocks',
  },
  {
    col1: 'whatever',
    col2: 'you want',
  },
];

const exampleColumns: Column<DataType>[] = [
  {
    Header: 'Column 1',
    accessor: 'col1', // accessor is the "key" in the data
  },
  {
    Header: 'Column 2',
    accessor: 'col2',
    Cell: props => {
      return <h4> {props.value}</h4>;
    },
  },
  {
    Header: 'Column 3',
    accessor: 'col3',
    disableSortBy: true,
    Cell: ({ cell }) => {
      const {
        row: { values },
      } = cell;
      return (
        <p>
          {values.col1} {values.col2}
        </p>
      );
    },
  },
];
export const Example: ComponentStory<typeof Table> = args => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  return <Table<DataType> {...args} data={data} columns={columns} />;
};

interface FetchDataPros {
  sortBy?: SortingRule<typeof exampleDatas>[];
}
const fetchData = (props?: FetchDataPros) => {
  const data = [...exampleDatas];
  if (!props) return data;
  const { sortBy } = props;
  if (!sortBy || sortBy.length === 0) return data;
  const { desc, id } = sortBy[0];
  data.sort((a, b) => {
    const Id = id as keyof typeof exampleDatas[0];
    const str1 = a[Id] || '';
    const str2 = b[Id] || '';
    const diff = str1.toLowerCase() > str2.toLowerCase() ? 1 : -1;
    if (desc) {
      return diff;
    }
    return -1 * diff;
  });

  return data;
};

interface DataType {
  col1: string;
  col2: string;
  col3?: string;
}
export const ExampleWithSorting: ComponentStory<typeof Table> = args => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);

  return (
    <Table<DataType> {...args} data={data} columns={columns} isSortingEnabled />
  );
};

ExampleWithSorting.args = {
  onSort: undefined,
};

ExampleWithSorting.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const table = canvas.getByRole('table');
  expect(table).toBeInTheDocument();
  const tbody = canvas.getByRole('rowgroup');
  expect(tbody).toBeInTheDocument();

  const TbodyElement = within(tbody);
  let rows = TbodyElement.getAllByRole('row');
  expect(rows.length).toBe(3);

  let firstCell = rows[0].querySelector('[role="cell"]')?.innerHTML;
  expect(firstCell).toBe('Hello');

  const button = canvas.getAllByRole('button');
  userEvent.dblClick(button[0]);

  rows = TbodyElement.getAllByRole('row');
  firstCell = rows[0].querySelector('[role="cell"]')?.innerHTML;
  expect(firstCell).toBe('whatever');
};

export const ExampleWithStickyHeader = () => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  return (
    <Container>
      <Table data={data} columns={columns} isStickyHeader />
    </Container>
  );
};

export const ExampleWithManualSort = () => {
  const [state, setState] = useState(() => fetchData());

  const onSort = (props: FetchDataPros) => {
    const data = fetchData(props);
    setState(data);
  };

  const columns = useMemo(() => exampleColumns, []);

  return (
    <Table<DataType>
      columns={columns}
      data={state}
      isSortingEnabled
      onSort={onSort}
    />
  );
};

const Container = styled.div`
  height: 130px;
  overflow: auto;
  width: 100%;
`;

export const ExampleWithColumnToggle: ComponentStory<typeof Table> = args => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  return (
    <Table<DataType>
      {...args}
      data={data}
      columns={columns}
      visibleColumns={['col1', 'col2']}
    />
  );
};

ExampleWithColumnToggle.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const table = canvas.getByRole('table');
  expect(table).toBeInTheDocument();
  const tbody = canvas.getByRole('rowgroup');
  expect(tbody).toBeInTheDocument();

  const TbodyElement = within(tbody);
  let rows = TbodyElement.getAllByRole('row');
  expect(rows.length).toBe(3);

  const columnSelectButton = canvas.getByLabelText('Column Selection');
  userEvent.click(columnSelectButton);

  const column1 = canvas.getByLabelText('Column 1');
  userEvent.click(column1);
  let firstCell = rows[0].querySelector('[role="cell"]')?.innerHTML;
  expect(firstCell).not.toBe('Hello');
};

export const ExampleWithNavigation: ComponentStory<typeof Table> = args => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  return (
    <Flex gap={20} direction="column">
      <Table<DataType>
        {...args}
        data={data}
        columns={columns}
        isKeyboardNavigationEnabled
      />
    </Flex>
  );
};

export const ExampleWithOnClickRow: ComponentStory<typeof Table> = args => {
  const data = useMemo(() => exampleDatas, []);
  const columns = useMemo(() => exampleColumns, []);
  const [value, setValue] = useState<DataType>();
  const onClick = (currentRow?: DataType) => {
    setValue(currentRow);
  };
  return (
    <>
      <Table<DataType>
        {...args}
        data={data}
        columns={columns}
        onRowClick={onClick}
        isKeyboardNavigationEnabled
      />
      <pre>Current Value:{value && JSON.stringify(value)}</pre>
    </>
  );
};

ExampleWithOnClickRow.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const table = canvas.getByRole('table');
  expect(table).toBeInTheDocument();
  const tbody = canvas.getByRole('rowgroup');
  expect(tbody).toBeInTheDocument();

  const TbodyElement = within(tbody);
  let rows = TbodyElement.getAllByRole('row');
  expect(rows.length).toBe(3);

  let firstCell = rows[0].querySelector('[role="cell"]');
  expect(firstCell).not.toBe(null);
  userEvent.click(firstCell!);

  const preElement = canvasElement.querySelector('pre');
  expect(preElement?.innerHTML).toBe(
    'Current Value:{"col1":"Hello","col2":"World"}'
  );
};

export const ExampleWithLoadMoreButton: ComponentStory<typeof Table> = () => {
  const [state, setState] = useState(exampleDatas);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const mockPromise = new Promise(resolve =>
    setTimeout(() => resolve(exampleDatas), 1000)
  );

  const fetchMore = () => {
    setIsLoading(true);
    mockPromise.then((res: any) => {
      setState(prev => [...prev, ...res]);
      setIsLoading(false);
    });
    setHasNextPage(false);
  };

  const data = useMemo(() => state, [state]);
  const columns = useMemo(() => exampleColumns, []);

  return (
    <Table
      data={data}
      columns={columns}
      showLoadButton
      fetchMore={fetchMore}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
    />
  );
};

ExampleWithLoadMoreButton.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  let tbody = canvas.getByRole('rowgroup');

  let TbodyElement = within(tbody);
  let rows = TbodyElement.getAllByRole('row');
  expect(rows.length).toBe(3);

  const loadMoreButton = canvas.getByRole('button', { name: 'Load More' });
  userEvent.click(loadMoreButton);
  tbody = canvas.getByRole('rowgroup');

  await waitFor(() => expect(canvas.getAllByRole('row').length).toBe(7));
};
