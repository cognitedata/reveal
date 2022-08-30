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

describe('Sidebar tests', () => {
  it('Should render the open sidebar on load', async () => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: '/test-path',
    }));

    const MockSidebar: React.FC = () => {
      // Render with sidebar open
      const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

      return (
        <Sidebar
          bidProcessResult={mockBidProcessResult}
          opened={openedSidePanel}
          setOpened={setOpenedSidePanel}
        />
      );
    };

    testRenderer(<MockSidebar />);

    expect(screen.getByText('Price area overview')).toBeInTheDocument();
  });

  describe('Hide button tests', () => {
    it('Should close the sidebar when hide button is clicked', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: '/test-path',
      }));

      const MockSidebar: React.FC = () => {
        // Render with sidebar open
        const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

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

      const MockSidebar: React.FC = () => {
        // Render with sidebar closed
        const [openedSidePanel, setOpenedSidePanel] = React.useState(false);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

      testRenderer(<MockSidebar />);

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

      const MockSidebar: React.FC = () => {
        // Render with sidebar closed
        const [openedSidePanel, setOpenedSidePanel] = React.useState(false);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

      testRenderer(<MockSidebar />);

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

      const MockSidebar: React.FC = () => {
        // Render with sidebar open
        const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

      testRenderer(<MockSidebar />);

      const results = (await screen.findAllByRole('link')).length;
      const expectedResults = mockBidProcessResult.plants.length + 2; // +2 for Total and Price Scenarios buttons
      expect(results).toEqual(expectedResults);
    });

    it('Should display the correct plant names', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: `/portfolio/${mockBidProcessResult.priceAreaExternalId}/Total`,
      }));

      const MockSidebar: React.FC = () => {
        // Render with sidebar open
        const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

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

      const MockSidebar: React.FC = () => {
        // Render with sidebar open
        const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

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
      results.push('Total');
      results.push('Price Scenarios');
      const expectedResults = results.filter((result) =>
        result.toLowerCase().includes(query.toLowerCase())
      );

      expect(searchResults.sort()).toEqual(expectedResults.sort());
    });
  });

  describe('Matrix button tests', () => {
    it('Should navigate to correct url on click of button', async () => {
      (useLocation as jest.Mock).mockImplementation(() => ({
        pathname: `/portfolio/${mockBidProcessResult.priceAreaExternalId}/Total`,
      }));

      const MockSidebar: React.FC = () => {
        // Render with sidebar open
        const [openedSidePanel, setOpenedSidePanel] = React.useState(true);

        return (
          <Sidebar
            bidProcessResult={mockBidProcessResult}
            opened={openedSidePanel}
            setOpened={setOpenedSidePanel}
          />
        );
      };

      testRenderer(<MockSidebar />);

      const testPlant = mockBidProcessResult.plants[0];
      const testButton = screen.getByRole('link', {
        name: testPlant.displayName,
      });
      fireEvent.click(testButton);

      expect(global.window.location.href).toContain(
        `/portfolio/${mockBidProcessResult.priceAreaExternalId}/${testPlant.externalId}`
      );
    });
  });
});
