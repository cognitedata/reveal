import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom';
import {
  EXT_PIPE_TAB_OVERVIEW,
  EXT_PIPE_TAB_RUN_HISTORY,
} from 'utils/constants';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { render } from 'utils/test';
import { useExtpipeById } from 'hooks/useExtpipe';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { RunTableHeading } from 'components/extpipe/RunLogsCols';
import { useFilteredRuns, useRuns } from 'hooks/useRuns';
import ExtpipePage from 'pages/Extpipe/ExtpipePage';
import { useDataSetsList } from 'hooks/useDataSetsList';
// 
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

jest.mock('react-router-dom', () => {
  const r = jest.requireActual('react-router-dom');
  return {
    ...r,
    useLocation: jest.fn(),
    useRouteMatch: jest.fn(),
    useParams: jest.fn(),
  };
});

jest.mock('hooks/useExtpipe', () => {
  return {
    useExtpipeById: jest.fn(),
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
describe('ExtpipePage', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '', search: '' });
    useRouteMatch.mockReturnValue({ path: 'path', url: '/' });
    useParams.mockReturnValue({ id: 1 });
    useDataSetsList.mockReturnValue({ data: mockDataSetResponse() });
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'extpipes-ui-style-scope');
    document.body.appendChild(modalRoot);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should not showing page while loading', () => {
    useExtpipeById.mockReturnValue({ data: {}, isLoading: true });
    const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined
    );
    render(<ExtpipePage />, { wrapper });
    expect(screen.queryByText(EXT_PIPE_TAB_OVERVIEW)).not.toBeInTheDocument();
    expect(
      screen.queryByText(EXT_PIPE_TAB_RUN_HISTORY)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Contacts')).not.toBeInTheDocument();
  });

  const mockExtpipe = getMockResponse()[2];
  const mockDataSet = mockDataSetResponse()[2];
  const mockData = { ...mockExtpipe, dataSet: mockDataSet };
  function renderExtpipePage() {
    useExtpipeById.mockReturnValue({
      data: mockData,
      isLoading: false,
    });
    useRouteMatch.mockReturnValue({ path: '/', url: '/' });
    useRuns.mockReturnValue({ data: mockDataRunsResponse.items });
    useFilteredRuns.mockReturnValue({
      data: { runs: mockDataRunsResponse.items },
    });
    const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockExtpipe,
      '/'
    );
    render(<ExtpipePage />, { wrapper });
  }

  test.skip('Render extpipe and navigate on subpages', () => {
    renderExtpipePage();
    expect(screen.getByText(EXT_PIPE_TAB_OVERVIEW)).toBeInTheDocument();
    const runsLink = screen.getByText(EXT_PIPE_TAB_RUN_HISTORY);
    expect(runsLink).toBeInTheDocument();
    // check some details are renderd
    expect(screen.getAllByText(mockData.name).length).toEqual(1); // heading + breadcrumb
    expect(screen.getByText(mockData.description)).toBeInTheDocument();
    expect(screen.getByText(mockData.externalId)).toBeInTheDocument();
    expect(screen.getAllByText(mockData.dataSet.name).length).toEqual(2); // breadcrumb and side bar
    expect(screen.getAllByText(mockExtpipe.source).length).toEqual(1); // side bar
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

  const getDialogHeaderElement = () =>
    screen.queryByText('Delete "PI AF extpipe"?');

  async function clickDeletePipeline() {
    fireEvent.click(screen.getByTestId('extpipe-actions-dropdown-button'));
    fireEvent.click(screen.getByTestId('delete-menu-item'));
  }

  test.skip('Dialog pops up when clicking', async () => {
    renderExtpipePage();
    expect(getDialogHeaderElement()).not.toBeInTheDocument();
    await clickDeletePipeline();
    expect(getDialogHeaderElement()).toBeInTheDocument();
  });

  test('Dialog closes when clicking cancel', async () => {
    renderExtpipePage();
    await clickDeletePipeline();
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(getDialogHeaderElement()).not.toBeInTheDocument();
  });

  const getInputFieldForDeleteConfirm = () =>
    screen.getByLabelText('Type DELETE to confirm');

  test('Delete button should only be enabled when DELETE is written', async () => {
    renderExtpipePage();
    await clickDeletePipeline();

    const confirmTextField = getInputFieldForDeleteConfirm();
    const deleteButtonInsideDialog = screen.getByTestId('delete-btn', {
      selector: '.cogs-btn',
    });

    expect(deleteButtonInsideDialog.disabled).toBe(true);
    fireEvent.change(confirmTextField, { target: { value: 'DELETE' } });
    expect(deleteButtonInsideDialog.disabled).toBe(false);
    fireEvent.change(confirmTextField, { target: { value: 'abc' } });
    expect(deleteButtonInsideDialog.disabled).toBe(true);
    fireEvent.change(confirmTextField, { target: { value: 'delete' } });
    expect(deleteButtonInsideDialog.disabled).toBe(false);
  });

  test('Forget text in between dialog opens', async () => {
    renderExtpipePage();
    await clickDeletePipeline();

    fireEvent.change(getInputFieldForDeleteConfirm(), {
      target: { value: 'abc' },
    });

    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(getDialogHeaderElement()).not.toBeInTheDocument();

    await clickDeletePipeline();
    expect(getInputFieldForDeleteConfirm().value).toBe('');
  });
});
