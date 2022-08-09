import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { DetailFieldNames } from 'model/Extpipe';
import { ExtpipeDetails } from 'components/extpipe/ExtpipeDetails';
import { trackUsage } from 'utils/Metrics';
import { useSDK } from '@cognite/sdk-provider';
import { render } from 'utils/test';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe('ExtpipeView', () => {
  const mockExtpipe = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockExtpipe,
      '/'
    );
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test.skip('Displays extpipe', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: mockExtpipe }),
      datasets: {
        retrieve: () => Promise.resolve([mockDataSet]),
      },
    });

    render(<ExtpipeDetails />, {
      wrapper: wrapper.wrapper,
    });
    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith({
      t: 'Extraction pipeline.Details',
      id: mockExtpipe.id,
    });
    await waitFor(() => {
      screen.getAllByText(DetailFieldNames.DOCUMENTATION);
      screen.getByText(new RegExp(TableHeadings.CONTACTS, 'i'));
    });

    mockExtpipe.contacts.forEach((contact) => {
      expect(screen.getByText(contact.name)).toBeInTheDocument();
      expect(screen.getByText(contact.email)).toBeInTheDocument();
    });
    expect(
      screen.getByText(new RegExp(DetailFieldNames.EXTERNAL_ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockExtpipe.externalId)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockExtpipe.id)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(TableHeadings.DATA_SET))
    ).toBeInTheDocument();
    expect(screen.getByText(mockDataSet.name)).toBeInTheDocument();

    // eslint-disable-next-line no-unused-expressions
    mockExtpipe.rawTables?.forEach(({ dbName, tableName }) => {
      expect(screen.getByText(dbName)).toBeInTheDocument();
      expect(screen.getByText(tableName)).toBeInTheDocument();
    });

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_BY, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockExtpipe.createdBy)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_TIME, 'i'))
    ).toBeInTheDocument();
    // expect(
    //   screen.getByText(
    //     moment(mockExtpipe.createdTime).from('2021-06-01T14:00:00Z')
    //   )
    // ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(DetailFieldNames.LAST_UPDATED_TIME, 'i'))
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(new RegExp(TableHeadings.SCHEDULE, 'i')).length
    ).toEqual(2); // general info and top bar
    expect(screen.getAllByText('At 09:00 AM').length).toEqual(2);
  });

  test.skip('Renders with minimal required info', async () => {
    const mock = {
      id: 123,
      externalId: 'lisa.external.id',
      name: 'My extpipe',
    };
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: mock }),
    });
    render(<ExtpipeDetails />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.externalId);
    });
    expect(screen.getByText(mock.externalId)).toBeInTheDocument();
    expect(screen.getByText(mock.id)).toBeInTheDocument();
    expect(screen.getByText(/add raw tables/i)).toBeInTheDocument();
    expect(screen.getByText(/add schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/add data set/i)).toBeInTheDocument();
  });
});
