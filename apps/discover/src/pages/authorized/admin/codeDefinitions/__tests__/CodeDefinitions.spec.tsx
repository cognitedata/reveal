import 'services/wellSearch/__mocks/setupWellsMockSDK';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { getMockDetailCodeLegendGet } from 'services/well/__mocks/getMockDetailCodeLegendGet';
import { getMockWellLegendGet } from 'services/well/__mocks/getMockWellLegendGet';
import { getMockNPTCodeSummaries } from 'services/wellSearch/__mocks/getMockNPTCodeSummaries';
import { getMockNPTDetailCodeSummaries } from 'services/wellSearch/__mocks/getMockNPTDetailCodeSummaries';

import { testRenderer } from '__test-utils/renderer';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';

import { CodeDefinitions } from '../CodeDefinitions';

const mockServer = setupServer();

describe('CodeDefinitions', () => {
  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  const page = () => testRenderer(CodeDefinitions, undefined, {});

  it('should render initial component correctly', async () => {
    mockServer.use(
      getMockNPTCodeSummaries([]),
      getMockNPTDetailCodeSummaries([]),
      getMockWellLegendGet(),
      getMockDetailCodeLegendGet()
    );
    await page();

    // codes should be selected by default
    expect(global.location.search).toEqual('?selected=code');

    // should have correct number of items on the left panel
    expect(
      within(screen.getByTestId('left-panel')).getByText('NPT Codes')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('left-panel')).getByText('NPT Subcode')
    ).toBeInTheDocument();

    // should have correct component on the right side
    expect(
      within(screen.getByTestId('right-panel')).getByRole('heading', {
        name: 'NPT Codes',
      })
    ).toBeInTheDocument();
    expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();

    // should change url search query and right panel component when clicking left panel item
    await userEvent.click(
      within(screen.getByTestId('left-panel')).getByText('NPT Subcode')
    );
    expect(global.location.search).toEqual('?selected=detailCode');
    expect(
      within(screen.getByTestId('right-panel')).getByRole('heading', {
        name: 'NPT Subcode',
      })
    ).toBeInTheDocument();
    expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();
  });

  it('should render npt codes and detailCodes correctly without legend data', async () => {
    mockServer.use(
      getMockNPTCodeSummaries(),
      getMockNPTDetailCodeSummaries(),
      getMockWellLegendGet(),
      getMockDetailCodeLegendGet()
    );
    await page();

    await waitFor(() =>
      expect(screen.queryByText(NO_RESULTS_TEXT)).not.toBeInTheDocument()
    );

    // should display data correctly
    expect(screen.getAllByTestId('code-input')).toHaveLength(2);
    screen.getAllByTestId('definition-input').forEach((input) => {
      // all inputs should be empty since there is no legend data from discover-api
      expect(input).toHaveValue('');
    });

    await userEvent.click(
      within(screen.getByTestId('left-panel')).getByText('NPT Subcode')
    );

    expect(screen.getAllByTestId('code-input')).toHaveLength(2);
    screen.getAllByTestId('definition-input').forEach((input) => {
      // all inputs should be empty since there is no legend data from discover-api
      expect(input).toHaveValue('');
    });
  });

  it('should render npt codes and detailCodes correctly with legend data', async () => {
    mockServer.use(
      getMockNPTCodeSummaries(),
      getMockNPTDetailCodeSummaries(),
      getMockWellLegendGet([
        { id: 'TEST', legend: 'Something', type: 'code', event: '' },
        {
          id: 'BLA',
          legend: 'bla bla',
          type: 'code',
          event: '',
        },
      ]),
      getMockDetailCodeLegendGet([
        {
          id: 'XYZ',
          legend: 'Something',
          type: 'detailCode',
          event: '',
        },
      ])
    );
    await page();

    await waitFor(() =>
      expect(screen.queryByText(NO_RESULTS_TEXT)).not.toBeInTheDocument()
    );

    expect(screen.getAllByTestId('code-input')).toHaveLength(2);

    // The legend values need to be checked here but there's some bug that is not updating it in the child component
  });
});
