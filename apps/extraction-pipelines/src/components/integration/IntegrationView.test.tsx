import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import moment from 'moment';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { getMockResponse } from 'utils/mockResponse';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import {
  DOCUMENTATION_HEADING,
  NO_SCHEDULE,
  SINGLE_INTEGRATION,
} from 'utils/constants';
import { IntegrationView } from 'components/integration/IntegrationView';
import { trackUsage } from 'utils/Metrics';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { render } from 'utils/test';

describe('IntegrationView', () => {
  const mockIntegration = getMockResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockIntegration,
      '/'
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Displays integration', async () => {
    sdkv3.get.mockResolvedValue({ data: mockIntegration });
    render(<IntegrationView />, {
      wrapper: wrapper.wrapper,
    });
    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_INTEGRATION, {
      id: mockIntegration.id,
    });
    await waitFor(() => {
      screen.getByText(DOCUMENTATION_HEADING);
    });

    expect(
      screen.getByText(new RegExp(DetailFieldNames.EXTERNAL_ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.id)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_BY, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.createdBy)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_TIME, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(moment(mockIntegration.createdTime).fromNow())
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(DetailFieldNames.LAST_UPDATED_TIME, 'i'))
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(new RegExp(TableHeadings.SCHEDULE, 'i')).length
    ).toEqual(2); // general info and top bar
    expect(screen.getAllByText('At 09:00 AM').length).toEqual(2);
  });

  test('Renders with minimal required info', async () => {
    const mock = {
      id: 123,
      externalId: 'lisa.external.id',
      name: 'My integration',
    };
    sdkv3.get.mockResolvedValue({ data: mock });
    render(<IntegrationView />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.externalId);
    });
    expect(screen.getByText(mock.externalId)).toBeInTheDocument();
    expect(screen.getByText(mock.id)).toBeInTheDocument();
    expect(screen.getAllByText(NO_SCHEDULE).length).toEqual(2);
  });
});
