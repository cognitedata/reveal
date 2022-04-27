import { PriceArea } from '@cognite/power-ops-api-types';

import { Cols } from '../../types';

export function getActiveColumns(
  activeTab: string,
  priceArea: PriceArea
): Cols[] {
  let columns: Cols[] = [];

  // If on total tab, one column for each Scenario
  if (activeTab === 'total') {
    columns = priceArea?.priceScenarios.map((scenario, index) => {
      const header: Cols = {
        Header: scenario.name,
        id: scenario.externalId,
        accessor: `scenario-${index}`,
        columns: [
          {
            Header: 'Auction Matrix',
            accessor: `calc-${index}`,
          },
          {
            Header: 'Shop',
            accessor: `shop-${index}`,
          },
        ],
        disableSortBy: true,
      };
      return header;
    });
  } else {
    // If on Scenario tab, filter by specific scenario
    const index = priceArea?.priceScenarios.findIndex(
      (scenario) => scenario.externalId === activeTab
    );
    columns = priceArea?.priceScenarios
      .filter((scenario) => scenario.externalId === activeTab)
      .flatMap((scenario) => {
        // First column is Total Volume
        const totalColumn: Cols = {
          Header: 'Total Volume',
          id: scenario.externalId,
          accessor: `scenario-${index}`,
          columns: [
            {
              Header: 'Calc',
              accessor: `calc-${index}`,
            },
            {
              Header: 'Shop',
              accessor: `shop-${index}`,
            },
          ],
          disableSortBy: true,
        };
        // The following columns are for each plant
        const plantColumns: Cols[] = scenario.plantProduction.map(
          (plant, plantIndex) => {
            return {
              Header: priceArea?.plants.find(
                (specificPlant) =>
                  specificPlant.externalId === plant.plantExternalId
              )?.name,
              id: `plant-${plantIndex}`,
              accessor: `plant-${plantIndex}`,
              columns: [
                {
                  Header: 'Calc',
                  accessor: `calc-plant-${plantIndex}`,
                },
                {
                  Header: 'Shop',
                  accessor: `shop-plant-${plantIndex}`,
                },
              ],
              disableSortBy: true,
            };
          }
        );
        return [totalColumn, ...plantColumns];
      });
  }

  // Add hour column in to front of array
  const totalColumns = [
    {
      Header: 'Hour',
      accessor: 'hour',
      disableSortBy: true,
      sticky: 'left',
    },
    ...columns,
  ];
  return totalColumns;
}
