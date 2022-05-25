import { fireEvent, screen } from '@testing-library/react';
import {
  PriceAreasContext,
  PriceAreasContextType,
} from 'providers/priceAreaProvider';
import * as React from 'react';
import * as utils from 'utils/utils';
import { useLocation } from 'react-router-dom';
import { mockPriceArea } from 'utils/test';
import { testRenderer } from 'utils/test/render';

import { MenuBar } from './Menubar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('Menubar tests', () => {
  const handleLogout = jest.spyOn(utils, 'handleLogout');

  beforeAll(() =>
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: '/test-path',
    }))
  );
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
    const MockMenubar: React.FC = () => {
      const priceAreas: PriceAreasContextType = React.useMemo(
        () => ({
          allPriceAreas: [mockPriceArea],
          priceAreaChanged: () => false,
        }),
        []
      );

      return (
        <PriceAreasContext.Provider value={priceAreas}>
          <MenuBar />
        </PriceAreasContext.Provider>
      );
    };

    testRenderer(<MockMenubar />);

    const portfolioTab = await screen.findByRole('tab', { name: /Portfolio/i });
    fireEvent.click(portfolioTab);

    const priceAreaButton = await screen.findByRole('button', {
      name: mockPriceArea.name,
    });

    expect(priceAreaButton).toBeInTheDocument();
  });

  it('Should navigate to correct url when selecting price area', async () => {
    const MockMenubar: React.FC = () => {
      const priceAreas: PriceAreasContextType = React.useMemo(
        () => ({
          allPriceAreas: [mockPriceArea],
          priceAreaChanged: () => false,
        }),
        []
      );

      return (
        <PriceAreasContext.Provider value={priceAreas}>
          <MenuBar />
        </PriceAreasContext.Provider>
      );
    };

    testRenderer(<MockMenubar />);

    const portfolioTab = await screen.findByRole('tab', { name: /Portfolio/i });
    fireEvent.click(portfolioTab);

    const priceAreaButton = await screen.findByRole('button', {
      name: mockPriceArea.name,
    });
    fireEvent.click(priceAreaButton);

    expect(global.window.location.href).toContain(
      `/portfolio/${mockPriceArea.externalId}/total`
    );
  });

  it('Should logout successfully', async () => {
    testRenderer(<MenuBar />);

    const logoutButton = await screen.findByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    expect(handleLogout).toBeCalled();
  });
});
