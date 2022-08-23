import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import sdk from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { mapDataSetToExtpipe } from 'utils/dataSetUtils';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import {
  getExtpipeTableColumns,
  TableHeadings,
} from 'components/table/ExtpipeTableCol';
import { renderWithSelectedExtpipeContext } from 'utils/test/render';
import ExtpipesTable from 'components/table/ExtpipesTable';

describe('<ExtpipesTable/>', () => {
  const mockExtpipe = {
    ...getMockResponse()[0],
    dataSet: mockDataSetResponse()[0],
  };
  beforeEach(() => {
    sdk.get.mockResolvedValue({ data: { items: getMockResponse() } });
    sdk.datasets.retrieve.mockResolvedValue(mockDataSetResponse());
    const extpipes = mapDataSetToExtpipe(
      getMockResponse(),
      mockDataSetResponse()
    );
    const { extpipeTableColumns } = getExtpipeTableColumns(jest.fn());
    renderWithSelectedExtpipeContext(
      <ExtpipesTable extpipes={extpipes} columns={extpipeTableColumns} />,
      { initExtpipe: mockExtpipe, client: new QueryClient() }
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Render without errors', () => {
    const colsWithHeaders = [TableHeadings.NAME, TableHeadings.LAST_RUN_STATUS];
    colsWithHeaders.forEach((heading) => {
      const header = screen.getByText(new RegExp(heading));
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with row selection', () => {
    const sapLabel = screen.getByText(getMockResponse()[1].name);
    fireEvent.click(sapLabel);
    expect(sapLabel.getAttribute('aria-selected')).toEqual('true');
    const azureLabel = screen.getByText(getMockResponse()[0].name);
    fireEvent.click(azureLabel);
    expect(azureLabel.getAttribute('aria-selected')).toEqual('true');
    expect(sapLabel.getAttribute('aria-selected')).toEqual('false');
  });

  test('render and interact with sort on header: Name', () => {
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Extpipe');
    fireEvent.click(nameHeader); // to filter acending
    fireEvent.click(nameHeader); // to filter decending
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Extpipe');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });

  test('render and interact with global filter', async () => {
    const searchInput = screen.getByTestId('search-extpipes');

    const searchName = {
      string: 'sap',
      regexp: /sap/i,
    };
    // should filter the sap extpipe
    fireEvent.change(searchInput, { target: { value: searchName.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByText(searchName.regexp);
      expect(resultRows.length).toEqual(1);
    });

    // clear search should show all rows
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(getMockResponse().length + 1);
    });

    // should filter based name column
    const search = {
      string: 'birger',
      regexp: /birger/i,
    };
    fireEvent.change(searchInput, { target: { value: search.string } });
    await waitFor(() => {
      const b = screen.getAllByText(search.regexp);
      expect(b.length).toEqual(1);
    });

    // should filter from created by col
    /*
    const searchJacek = {
      string: 'jacek',
      regexp: /jacek/i,
    };
    fireEvent.change(searchInput, { target: { value: searchJacek.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByLabelText(searchJacek.regexp);
      expect(resultRows.length).toEqual(3);
    });
    */

    // should filter from data sets by col
    const searchDataSet = {
      string: 'aker',
      regexp: /aker/i,
    };
    fireEvent.change(searchInput, { target: { value: searchDataSet.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByText(searchDataSet.regexp);
      expect(resultRows.length).toEqual(1);
    });

    // should filter from from external id
    const searchExternalId = {
      string: mockExtpipe.externalId,
      regexp: mockExtpipe.name,
    };
    fireEvent.change(searchInput, {
      target: { value: searchExternalId.string },
    });
    await waitFor(() => {
      const resultRows = screen.getAllByText(searchExternalId.regexp);
      expect(resultRows.length).toEqual(1);
    });
  });
});
