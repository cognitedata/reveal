import { fireEvent, screen } from '@testing-library/react';
import * as utils from 'utils/utils';
import { useLocation } from 'react-router-dom';
import { mockBidProcessResult, mockPriceArea } from 'utils/test';
import { testRenderer } from 'utils/test/render';
import * as priceAreaHook from 'queries/useFetchPriceAreas';

import { MenuBar } from './Menubar';

jest.mock('@cognite/react-container', () => {
  return {
    ...jest.requireActual('@cognite/react-container'),
    useAuthenticatedAuthContext: () => ({
      authState: { token: 'Mock', email: 'mockuser@cognitedata.com' },
    }),
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('Menubar tests', () => {
  const handleLogout = jest.spyOn(utils, 'handleLogout');

  beforeAll(() => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: '/test-path',
    }));
    // @ts-expect-error We dont need the full implementation of the hook
    jest.spyOn(priceAreaHook, 'useFetchPriceAreas').mockImplementation(() => ({
      data: [mockPriceArea],
    }));
  });
  afterAll(jest.clearAllMocks);

  it('Should render', async () => {
    testRenderer(<MenuBar />);

    const menubar = await screen.findByTestId('top-bar');
    expect(menubar).toBeInTheDocument();
  });

  it('Should show dropdown on click', async () => {
    testRenderer(<MenuBar />);

    const portfolioTab = await screen.findByRole('tab', { name: /Portfolio/i });
    fireEvent.click(portfolioTab);

    const dropdown = await screen.findByRole('tooltip', {
      name: /Price Area/i,
    });
    expect(dropdown).toBeInTheDocument();
  });

  it('Should show price area in portfolio dropdown', async () => {
    testRenderer(<MenuBar />);

    const portfolioTab = await screen.findByRole('tab', { name: /Portfolio/i });
    fireEvent.click(portfolioTab);

    const priceAreaButton = await screen.findByRole('button', {
      name: mockBidProcessResult.priceAreaName,
    });

    expect(priceAreaButton).toBeInTheDocument();
  });

  it('Should navigate to correct url when selecting price area', async () => {
    testRenderer(<MenuBar />);

    const portfolioTab = await screen.findByRole('tab', { name: /Portfolio/i });
    fireEvent.click(portfolioTab);

    const priceAreaButton = await screen.findByRole('button', {
      name: mockBidProcessResult.priceAreaName,
    });
    fireEvent.click(priceAreaButton);

    expect(global.window.location.href).toContain(
      `/portfolio/${mockBidProcessResult.priceAreaExternalId}/total`
    );
  });

  it('Should logout successfully', async () => {
    testRenderer(<MenuBar />);

    const logoutButton = await screen.findByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    expect(handleLogout).toBeCalled();
  });
});
