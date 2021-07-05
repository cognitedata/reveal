import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { useLocation, useRouteMatch, useParams } from 'react-router-dom';
import {
  CONTACTS,
  EXT_PIPE_TAB_OVERVIEW,
  EXT_PIPE_TAB_RUN_HISTORY,
} from 'utils/constants';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { render } from 'utils/test';
import { useIntegrationById } from 'hooks/useIntegration';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { RunTableHeading } from 'components/integration/RunLogsCols';
import { useFilteredRuns, useRuns } from 'hooks/useRuns';
import IntegrationPage from 'pages/Integration/IntegrationPage';
import { useDataSetsList } from 'hooks/useDataSetsList';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { INTEGRATIONS_ACL } from 'model/AclAction';

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
jest.mock('hooks/useRuns', () => {
  return {
    useRuns: jest.fn(),
    useFilteredRuns: jest.fn(),
  };
});
jest.mock('hooks/useDataSetsList', () => {
  return {
    useDataSetsList: jest.fn(),
  };
});
jest.mock('components/chart/RunChart', () => {
  return {
    RunChart: () => {
      return <div />;
    },
  };
});
describe('IntegrationPage', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '', search: '' });
    useRouteMatch.mockReturnValue({ path: 'path', url: '/' });
    useParams.mockReturnValue({ id: 1 });
    useDataSetsList.mockReturnValue({ data: mockDataSetResponse() });
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: INTEGRATIONS_ACL, actions: ['READ', 'WRITE'] }],
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should not showing page while loading', () => {
    useIntegrationById.mockReturnValue({ data: {}, isLoading: true });
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined
    );
    render(<IntegrationPage />, { wrapper });
    expect(screen.queryByText(EXT_PIPE_TAB_OVERVIEW)).not.toBeInTheDocument();
    expect(
      screen.queryByText(EXT_PIPE_TAB_RUN_HISTORY)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(CONTACTS)).not.toBeInTheDocument();
  });

  test('Render integration and navigate on subpages', async () => {
    const mockIntegration = getMockResponse()[2];
    const mockDataSet = mockDataSetResponse()[2];
    const mockData = { ...mockIntegration, dataSet: mockDataSet };
    useIntegrationById.mockReturnValue({
      data: mockData,
      isLoading: false,
    });
    useRouteMatch.mockReturnValue({ path: '/', url: '/' });
    useRuns.mockReturnValue({ data: mockDataRunsResponse.items });
    useFilteredRuns.mockReturnValue({
      data: { runs: mockDataRunsResponse.items },
    });
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockIntegration,
      '/'
    );
    render(<IntegrationPage />, { wrapper });
    expect(screen.getByText(EXT_PIPE_TAB_OVERVIEW)).toBeInTheDocument();
    const runsLink = screen.getByText(EXT_PIPE_TAB_RUN_HISTORY);
    expect(runsLink).toBeInTheDocument();
    // check some details are renderd
    expect(screen.getAllByText(mockData.name).length).toEqual(2); // heading + breadcrumb
    expect(screen.getByText(mockData.description)).toBeInTheDocument();
    expect(screen.getByText(mockData.externalId)).toBeInTheDocument();
    expect(screen.getAllByText(mockData.dataSet.name).length).toEqual(3); // breadcrumb, heading and side bar
    expect(screen.getAllByText(mockIntegration.source).length).toEqual(2); // heading and side bar
    // navigate to runs
    fireEvent.click(runsLink);
    expect(
      screen.queryByText(mockData.contacts[0].name)
    ).not.toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.TIMESTAMP)).toBeInTheDocument();
    expect(
      screen.getAllByText(new RegExp(TableHeadings.LAST_RUN_STATUS, 'i')).length
    ).toEqual(2); // filter and heading
    expect(screen.getByText(RunTableHeading.MESSAGE)).toBeInTheDocument();
  });
});
