import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mockPriceArea, testRenderer, getTestCogniteClient } from 'utils/test';
import { setupServer } from 'msw/node';
import { useAuthContext } from '@cognite/react-container';

import { PriceScenarios } from './PriceScenarios';
import { getMockTimeseriesData } from './PriceScenarios.mock';

const mockServer = setupServer(getMockTimeseriesData());

jest.mock('@cognite/react-container', () => ({
  useAuthContext: jest.fn(),
}));

describe('Price scenario page tests', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  beforeEach(() => {
    (useAuthContext as jest.Mock).mockImplementation(() => ({
      client: getTestCogniteClient(),
    }));
  });

  describe('Tabs tests', () => {
    it('Should display correct tabs', async () => {
      testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

      const expectedScenarioTabs = mockPriceArea.priceScenarios.map(
        (scenario) => scenario.name
      );
      const expectedTabs = ['Total', ...expectedScenarioTabs];
      const allTabs = (await screen.findAllByRole('tab')).map(
        (tab) => tab.textContent
      );
      await waitFor(() => expect(allTabs).toEqual(expectedTabs));
    });

    it('Should switch to new tab onclick', async () => {
      testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

      const firstScenario = mockPriceArea.priceScenarios[0].name;
      const tab = await screen.findByRole('tab', {
        name: firstScenario,
      });
      fireEvent.click(tab);

      await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
    });
  });

  describe('Price scenario table tests', () => {
    it('Should render price scenario table', async () => {
      testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

      const table = await screen.findByRole('table');
      await waitFor(() => expect(table).toBeInTheDocument());
    });

    it('Should have the correct number of rows', async () => {
      testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

      await waitFor(async () => {
        const rows = await screen.findAllByRole('row');
        expect(rows).toHaveLength(26); // 24 hours + 1 header + 1 subheader
      });
    });

    it.each(mockPriceArea.priceScenarios)(
      'Should display correct column headers when on total tab',
      async (scenario) => {
        testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

        expect(
          await screen.findByRole('columnheader', { name: scenario.name })
        ).toBeInTheDocument();
      }
    );

    it.each(mockPriceArea.priceScenarios[0].plantProduction)(
      'Should display correct column headers when on scenario tab',
      async (plant) => {
        testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

        // Go to first scenario tab
        const firstScenario = mockPriceArea.priceScenarios[0];
        const tab = await screen.findByRole('tab', {
          name: firstScenario.name,
        });
        fireEvent.click(tab);

        const columnHeader = await screen.findByRole('columnheader', {
          name: plant.plantName,
        });
        await waitFor(() => expect(columnHeader).toBeInTheDocument());
      }
    );

    it('Should display column subheaders', async () => {
      testRenderer(<PriceScenarios priceArea={mockPriceArea} />);

      const expectedLength = mockPriceArea.priceScenarios.length;
      const matrixSubcolumn = await screen.findAllByRole('columnheader', {
        name: /matrix/i,
      });
      await waitFor(() => expect(matrixSubcolumn).toHaveLength(expectedLength));

      const shopSubcolumn = await screen.findAllByRole('columnheader', {
        name: /shop/i,
      });
      await waitFor(() => expect(shopSubcolumn).toHaveLength(expectedLength));
    });
  });
});
