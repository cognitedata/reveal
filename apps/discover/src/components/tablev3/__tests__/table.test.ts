import { screen, fireEvent, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Table } from '../Table';

describe('Table', () => {
  const page = (viewProps?: any) => testRenderer(Table, undefined, viewProps);

  let handleRowClick: any;

  const data = [{ test: 'nice' }];
  const columns = [
    {
      Header: 'Test1',
      accessor: 'test',
      width: '200px',
    },
  ];

  beforeEach(() => {
    handleRowClick = jest.fn();
  });

  const defaultTestInit = async () => {
    return {
      ...page({
        data,
        columns,
        handleRowClick,
      }),
    };
  };

  test('create basic table', async () => {
    await defaultTestInit();

    const firstRow = await screen.findByText('nice');
    fireEvent.click(firstRow);

    await waitFor(() => {
      expect(handleRowClick.mock.calls.length).toEqual(1);
    });
  });

  // -test('enable/disable tooltip based on text length', async () => {
  //   Defeated by the test... Tried to first hovering over the table cell, expected: parent (span) element to get extra attributes (which happens on web), actual: nothing
  //   then I tried to test the 'isElementOverflowing' on a rendered element, expected: true, actual: false
  //   Check https://stackoverflow.com/questions/61305187/how-to-simulate-content-overflow-with-react-testing-library
  // });
});
