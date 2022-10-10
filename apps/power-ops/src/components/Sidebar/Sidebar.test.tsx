import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { mockBidProcessResult, testRenderer } from 'utils/test';

import { Sidebar } from './Sidebar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useRouteMatch: () => ({
    url: `/portfolio/${mockBidProcessResult.priceAreaExternalId}`,
  }),
}));

jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

const MockSidebar: React.FC<{ open?: boolean; path?: string }> = ({
  path,
  open = true,
}) => {
  // Render with sidebar open
  const [openedSidePanel, setOpenedSidePanel] = React.useState(open);

  return (
    <Sidebar
      plants={mockBidProcessResult.plants.map((plant) => ({
        name: plant.displayName,
        externalId: plant.externalId,
        url: `/${plant.externalId}`,
        current: false,
      }))}
      total={{ url: `${path}/total`, current: false }}
      priceScenarios={{ url: `${path}/price-scenarios`, current: false }}
      open={openedSidePanel}
      onOpenCloseClick={() => setOpenedSidePanel(!openedSidePanel)}
    />
  );
};

describe('Sidebar tests', () => {
  it('Should render the open sidebar on load', async () => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: '/test-path',
    }));

    testRenderer(<MockSidebar />);

    expect(screen.getByText('Price area overview')).toBeInTheDocument();
  });

  describe('Hide button tests', () => {
    it('Should close the sidebar when hide button is clicked', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: '/test-path',
      }));

      testRenderer(<MockSidebar />);

      const hideButton = screen.getByLabelText('Show or hide sidebar', {
        selector: 'button',
      });
      fireEvent.click(hideButton);

      expect(screen.queryByText('Price area overview')).not.toBeInTheDocument();
    });

    it('Should open the sidebar when show button is clicked', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: '/test-path',
      }));

      testRenderer(<MockSidebar open={false} />);

      const hideButton = screen.getByLabelText('Show or hide sidebar', {
        selector: 'button',
      });
      fireEvent.click(hideButton);

      expect(screen.getByText('Price area overview')).toBeInTheDocument();
    });
  });

  describe('Search bar tests', () => {
    it('Should open the sidebar when search button is clicked', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: '/test-path',
      }));

      testRenderer(<MockSidebar open={false} />);

      const searchButton = screen.getByLabelText('Open search field', {
        selector: 'button',
      });
      fireEvent.click(searchButton);

      expect(screen.getByText('Price area overview')).toBeInTheDocument();
    });

    it('Should return all plants + total and price scenarios if no query entered', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: `/portfolio/${mockBidProcessResult.priceAreaExternalId}/Total`,
      }));
      testRenderer(<MockSidebar />);

      const results = (await screen.findAllByRole('link')).length;
      const expectedResults = mockBidProcessResult.plants.length + 2; // +2 for Total and Price Scenarios buttons
      expect(results).toEqual(expectedResults);
    });

    it('Should display the correct plant names', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: `/portfolio/${mockBidProcessResult.priceAreaExternalId}/Total`,
      }));

      testRenderer(<MockSidebar />);

      const allButtons = await screen.findAllByRole('link');
      const plantButtons = allButtons
        .filter(
          (button) =>
            button.textContent !== 'Total' &&
            button.textContent !== 'Price Scenarios'
        )
        .map((result) => result.textContent);

      const expectedPlants = mockBidProcessResult.plants.map(
        (plant) => plant.displayName
      );

      expect(plantButtons.sort()).toEqual(expectedPlants.sort());
    });

    it('Should return correct results when given a query', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: `/portfolio/${mockBidProcessResult.priceAreaExternalId}/Total`,
      }));

      testRenderer(<MockSidebar />);

      const searchBar = screen.getByPlaceholderText('Search plants');
      // Search for the first plant in the price area
      const query = mockBidProcessResult.plants[0].displayName;
      fireEvent.change(searchBar, {
        target: { value: query },
      });

      const searchResults = (await screen.findAllByRole('link')).map(
        (button) => button.textContent
      );

      const results = mockBidProcessResult.plants.map(
        (plant) => plant.displayName
      );

      const expectedResults = results.filter((result) =>
        result.toLowerCase().includes(query.toLowerCase())
      );
      expectedResults.push('Total');
      expectedResults.push('Price Scenarios');

      expect(searchResults.sort()).toEqual(expectedResults.sort());
    });
  });
});
