import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { EXPANSION_COLUMN_ID, SELECTION_COLUMN_ID } from '../hooks';
import { TableColumnSortIcons } from '../TableColumnSortIcons';

describe('Table sort columns', () => {
  const page = (viewProps?: any) =>
    testRenderer(TableColumnSortIcons, undefined, viewProps);

  const defaultTestInit = async (column: any) => {
    return {
      ...page({
        column,
      }),
    };
  };

  test('check for default sort columns', async () => {
    const column = {
      Header: 'Test1',
      accessor: 'test',
      id: 'test',
      width: '200px',
    };

    await defaultTestInit(column);

    const sortColumn = screen.queryByTestId('default-sort');
    expect(sortColumn).toBeInTheDocument();

    const sortColumnAsc = screen.queryByTestId('ascending-sort');
    expect(sortColumnAsc).not.toBeInTheDocument();

    const sortColumnDes = screen.queryByTestId('descending-sort');
    expect(sortColumnDes).not.toBeInTheDocument();
  });

  test('check for ascending sort columns', async () => {
    const column = {
      Header: 'Test1',
      accessor: 'test',
      id: 'test',
      isSorted: true,
      isSortedDesc: false,
      width: '200px',
    };

    await defaultTestInit(column);

    const sortColumn = screen.queryByTestId('default-sort');
    expect(sortColumn).not.toBeInTheDocument();

    const sortColumnAsc = screen.queryByTestId('ascending-sort');
    expect(sortColumnAsc).toBeInTheDocument();

    const sortColumnDes = screen.queryByTestId('descending-sort');
    expect(sortColumnDes).not.toBeInTheDocument();
  });

  test('check for descending sort columns', async () => {
    const column = {
      Header: 'Test1',
      accessor: 'test',
      id: 'test',
      isSorted: true,
      isSortedDesc: true,
      width: '200px',
    };

    await defaultTestInit(column);

    const sortColumn = screen.queryByTestId('default-sort');
    expect(sortColumn).not.toBeInTheDocument();

    const sortColumnAsc = screen.queryByTestId('ascending-sort');
    expect(sortColumnAsc).not.toBeInTheDocument();

    const sortColumnDes = screen.queryByTestId('descending-sort');
    expect(sortColumnDes).toBeInTheDocument();
  });

  test('check for selected columns', async () => {
    const column = {
      Header: 'Test1',
      accessor: 'test',
      id: SELECTION_COLUMN_ID,
      width: '200px',
    };
    await defaultTestInit(column);

    const sortColumn = screen.queryByTestId('default-sort');
    expect(sortColumn).not.toBeInTheDocument();

    const sortColumnAsc = screen.queryByTestId('ascending-sort');
    expect(sortColumnAsc).not.toBeInTheDocument();

    const sortColumnDes = screen.queryByTestId('descending-sort');
    expect(sortColumnDes).not.toBeInTheDocument();
  });

  test('check for expanded columns', async () => {
    const column = {
      Header: 'Test1',
      accessor: 'test',
      id: EXPANSION_COLUMN_ID,
      width: '200px',
    };
    await defaultTestInit(column);

    const sortColumn = screen.queryByTestId('default-sort');
    expect(sortColumn).not.toBeInTheDocument();

    const sortColumnAsc = screen.queryByTestId('ascending-sort');
    expect(sortColumnAsc).not.toBeInTheDocument();

    const sortColumnDes = screen.queryByTestId('descending-sort');
    expect(sortColumnDes).not.toBeInTheDocument();
  });
});
