import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { useLocation, useRouteMatch, useParams } from 'react-router-dom';
import { CONTACTS, DETAILS, RUNS } from 'utils/constants';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { render } from 'utils/test';
import { useIntegrationById } from 'hooks/useIntegration';
import { getMockResponse, mockDataRunsResponse } from 'utils/mockResponse';
import { useDataSets } from 'hooks/useDataSets';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { RunTableHeading } from 'components/integration/RunLogsCols';
import { useRuns } from 'hooks/useRuns';
import IntegrationPage from 'pages/Integration/IntegrationPage';

jest.mock('react-router-dom', () => {
  const r = jest.requireActual('react-router-dom');
  return {
    ...r,
    useLocation: jest.fn(),
    useRouteMatch: jest.fn(),
    useParams: jest.fn(),
  };
});

jest.mock('hooks/useIntegration', () => {
  return {
    useIntegrationById: jest.fn(),
  };
});
jest.mock('hooks/useDataSets', () => {
  return {
    useDataSets: jest.fn(),
  };
});
jest.mock('hooks/useRuns', () => {
  return {
    useRuns: jest.fn(),
  };
});
describe('IntegrationPage', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '', search: '' });
    useRouteMatch.mockReturnValue({ path: 'path', url: '/' });
    useParams.mockReturnValue({ id: 1 });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should not showing page while loading', () => {
    useIntegrationById.mockReturnValue({ data: {}, isLoading: true });
    useDataSets.mockReturnValue({ data: {}, isLoading: true });
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined
    );
    render(<IntegrationPage />, { wrapper });
    expect(screen.queryByText(DETAILS)).not.toBeInTheDocument();
    expect(screen.queryByText(RUNS)).not.toBeInTheDocument();
    expect(screen.queryByText(CONTACTS)).not.toBeInTheDocument();
  });

  test('Render intgration and navigate on subpages', async () => {
    const mockIntegration = getMockResponse()[2];
    useIntegrationById.mockReturnValue({
      data: mockIntegration,
      isLoading: false,
    });
    useDataSets.mockReturnValue({});
    useRouteMatch.mockReturnValue({ path: '/', url: '/' });
    useRuns.mockReturnValue({ data: mockDataRunsResponse.items });
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockIntegration,
      '/'
    );
    render(<IntegrationPage />, { wrapper });
    expect(screen.getByText(DETAILS)).toBeInTheDocument();
    const runsLink = screen.getByText(RUNS);
    expect(runsLink).toBeInTheDocument();
    const contactsBtn = screen.getByText(CONTACTS);
    expect(contactsBtn).toBeInTheDocument();
    // check some details are renderd
    expect(screen.getAllByText(mockIntegration.name).length).toEqual(2); // heading and field
    expect(screen.getAllByText(mockIntegration.description).length).toEqual(2); // heading and field
    expect(screen.getAllByText(mockIntegration.externalId).length).toEqual(2);
    // navigate to runs
    fireEvent.click(runsLink);
    expect(
      screen.queryByText(mockIntegration.contacts[0].name)
    ).not.toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.TIMESTAMP)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(TableHeadings.STATUS, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.MESSAGE)).toBeInTheDocument();
  });
});
