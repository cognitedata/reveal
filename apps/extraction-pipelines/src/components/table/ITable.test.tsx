import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { mapDataSetToIntegration } from 'utils/dataSetUtils';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import {
  getIntegrationTableCol,
  TableHeadings,
} from 'components/table/IntegrationTableCol';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import ITable from 'components/table/ITable';
import { RunStatusUI } from 'model/Status';

describe('<ITable/>', () => {
  const cols = getIntegrationTableCol();
  const mockIntegration = {
    ...getMockResponse()[0],
    dataSet: mockDataSetResponse()[0],
  };
  beforeEach(() => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    sdkv3.datasets.retrieve.mockResolvedValue(mockDataSetResponse());
    const data = mapDataSetToIntegration(
      getMockResponse(),
      mockDataSetResponse()
    );
    renderWithSelectedIntegrationContext(
      <ITable data={data} columns={cols} />,
      { initIntegration: mockIntegration, client: new QueryClient() }
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
    expect(
      (sapLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('true');
    const azureLabel = screen.getByText(getMockResponse()[0].name);
    fireEvent.click(azureLabel);
    expect(
      (azureLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('true');
    expect(
      (sapLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('false');
  });

  test('render and interact with sort on header: Name', () => {
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Integration');
    fireEvent.click(nameHeader); // to filter acending
    fireEvent.click(nameHeader); // to filter decending
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Integration');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });

  test('render and interact with global filter', async () => {
    const searchInput = screen.getByPlaceholderText(/records/i);

    const searchName = {
      string: 'sap',
      regexp: /sap/i,
    };
    // should filter the sap integration
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
      string: mockIntegration.externalId,
      regexp: mockIntegration.name,
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
