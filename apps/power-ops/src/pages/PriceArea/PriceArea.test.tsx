import { screen, fireEvent } from '@testing-library/react';
import {
  testRenderer,
  getTestCogniteClient,
  mockBidProcessResult,
} from 'utils/test';
import * as bidProcessHook from 'queries/useFetchBidProcessResult';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useRouteMatch } from 'react-router-dom';

import { PriceArea } from './PriceArea';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

jest.mock('@cognite/react-container', () => {
  return {
    ...jest.requireActual('@cognite/react-container'),
    useAuthenticatedAuthContext: jest.fn(),
  };
});

describe('Price area page tests', () => {
  beforeAll(() => {
    (useRouteMatch as jest.Mock).mockImplementation(() => ({
      path: '/test-path',
    }));

    jest.spyOn(bidProcessHook, 'useFetchBidProcessResult').mockImplementation(
      // @ts-expect-error We dont need the full implementation of the hook
      (_priceAreaExternalId, _bidProcessEventExternalId) => ({
        data: mockBidProcessResult,
      })
    );
  });
  beforeEach(() => {
    (useAuthenticatedAuthContext as jest.Mock).mockImplementation(() => ({
      client: getTestCogniteClient(),
    }));
  });
  afterAll(jest.clearAllMocks);

  it('Should render the price area', async () => {
    testRenderer(<PriceArea />);

    expect(await screen.findByTestId('pricearea-page')).toBeInTheDocument();
  });

  describe('Shop quality assurance tests', () => {
    it('Should display shop run penalties infobar', () => {
      testRenderer(<PriceArea />);

      expect(
        screen.getByText('Shop run penalties are above the recommended limit')
      ).toBeInTheDocument();
    });

    it('Should display shop run penalties modal on view report button click', async () => {
      testRenderer(<PriceArea />);

      const viewReportButton = await screen.findByRole('button', {
        name: /View Report/i,
      });
      fireEvent.click(viewReportButton);

      expect(await screen.findByTestId('shop-run-penalties-modal')).toHaveClass(
        'focus-visible'
      );
    });

    it('Should close shop run penalties modal on close button click', async () => {
      testRenderer(<PriceArea />);

      const viewReportButton = await screen.findByRole('button', {
        name: /View Report/i,
      });
      fireEvent.click(viewReportButton);

      const closeButton = await screen.findByTestId('close-modal-icon');
      fireEvent.click(closeButton);

      expect(
        await screen.findByTestId('shop-run-penalties-modal')
      ).not.toHaveClass('focus-visible');
    });
  });
});
