import { PriceScenariosChart } from 'components/PriceScenariosChart';
import { SetStateAction, useEffect, useState } from 'react';
import { pickChartColor } from 'utils/utils';
import { PriceAreaWithData, TableData, TableColumn } from 'types';
import { Column } from 'react-table';
import { HeadlessTable } from 'components/HeadlessTable';
import { useAuthContext } from '@cognite/react-container';
import { DoubleDatapoint, ExternalId } from '@cognite/sdk';
import dayjs from 'dayjs';
import { useMetrics } from '@cognite/metrics';

import {
  getActiveColumns,
  calculateProduction,
  getFormattedProductionColumn,
} from './utils';
import {
  Main,
  PriceScenariosContainer,
  StyledIcon,
  StyledTabs,
  StyledTable,
} from './elements';

export const PriceScenarios = ({
  priceArea,
}: {
  priceArea: PriceAreaWithData;
}) => {
  const metrics = useMetrics('price-scenarios');
  const { client } = useAuthContext();

  const bidDate = dayjs(priceArea.bidDate);

  const [priceExternalIds, setPriceExternalIds] = useState<
    { externalId: string }[] | undefined
  >();

  const [activeTab, setActiveTab] = useState<string>('total');

  const handleTabClickEvent = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === 'total') {
      metrics.track('click-total-tab');
    } else {
      metrics.track('click-price-scenario-tab', {
        priceScenarioExternalId: activeKey,
      });
    }
  };

  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);

  const getTableData = async () => {
    const activeScenarioIndex = priceArea?.priceScenarios.findIndex(
      (scenario) => scenario.externalId === activeTab
    );

    // Create array of column externalids
    const productionTsExternalIds: ExternalId[] = [];
    tableColumns.forEach(async (column, index) => {
      if (column.accessor?.includes('scenario')) {
        const scenario = priceArea?.priceScenarios.find(
          (scenario) => scenario.externalId === column.id
        );
        if (scenario) {
          productionTsExternalIds.push({
            externalId: scenario?.totalProduction.shopProductionExternalId,
          });
        }
      } else {
        // Get Plant from current scenario (activeTab)
        const plant = priceArea?.priceScenarios.find(
          (scenario) => scenario.externalId === activeTab
        )?.plantProduction?.[index - 2];

        if (plant) {
          productionTsExternalIds.push({
            externalId: plant?.production.shopProductionExternalId,
          });
        }
      }
    });

    // Get SHOP production data for the next day
    const shopProductionDatapoints =
      productionTsExternalIds &&
      (await client?.datapoints.retrieve({
        items: productionTsExternalIds.map((externalId) => {
          return externalId;
        }),
        start: bidDate.startOf('day').valueOf(),
        end: bidDate.endOf('day').valueOf(),
      }));

    const shopProductionData = shopProductionDatapoints
      ? await Promise.all(
          shopProductionDatapoints.map(async ({ datapoints }, index) => {
            let accessor = '';
            if (activeTab === 'total') {
              accessor = `shop-${index}`;
            } else {
              accessor =
                index === 0
                  ? `shop-${activeScenarioIndex}`
                  : `shop-plant-${index - 1}`;
            }

            const convertedDatapoints = (datapoints as DoubleDatapoint[]).map(
              (point) => ({
                ...point,
                // Multiply by (-1) all Total SHOP production for presentation (leave Plants unchanged)
                value: accessor.includes('plant')
                  ? point.value
                  : point.value * -1,
              })
            );

            return getFormattedProductionColumn(convertedDatapoints, accessor);
          })
        )
      : [];

    const priceTimeseries =
      activeTab === 'total'
        ? priceExternalIds &&
          (await client?.datapoints.retrieve({
            items: priceExternalIds.map((externalId) => {
              return externalId;
            }),
            start: bidDate.startOf('day').valueOf(),
            end: bidDate.endOf('day').valueOf(),
          }))
        : priceArea?.priceScenarios[activeScenarioIndex] &&
          (await client?.datapoints.retrieve({
            items: [
              {
                externalId:
                  priceArea?.priceScenarios[activeScenarioIndex].externalId,
              },
            ],
            start: bidDate.startOf('day').valueOf(),
            end: bidDate.endOf('day').valueOf(),
          }));

    const calcProductionData = priceTimeseries
      ? await calculateProduction(
          activeTab,
          activeScenarioIndex,
          priceTimeseries,
          priceArea
        )
      : [];

    // Combine both SHOP and calculated production values
    const combinedData = [...shopProductionData, ...calcProductionData];

    // Transpose rows and columns
    const transposedColumns = combinedData[0].map((_, index: number) =>
      combinedData.map((row) => row[index])
    );
    const priceScenarioTableData = transposedColumns.map(
      (row: any, index: number) => {
        // Convert each row from array of objects to object
        const formattedRow = Object.assign.apply(null, row);
        formattedRow.hour = index + 1;
        return formattedRow;
      }
    );
    setTableData(priceScenarioTableData);
  };

  useEffect(() => {
    if (priceArea) {
      const priceExternalIds = priceArea?.priceScenarios.map((scenario) => {
        return { externalId: scenario.externalId };
      });
      setPriceExternalIds(priceExternalIds);
    }
  }, [activeTab, priceArea]);

  useEffect(() => {
    const activeColumns = getActiveColumns(activeTab, priceArea);
    setTableColumns(activeColumns as TableColumn[]);
    getTableData();
  }, [priceExternalIds, priceArea]);

  return (
    <Main>
      <PriceScenariosContainer>
        <PriceScenariosChart
          priceArea={priceArea}
          externalIds={priceExternalIds}
          activeTab={activeTab}
          changeTab={(selectedTab: SetStateAction<string>) =>
            setActiveTab(selectedTab)
          }
          tableData={tableData}
        />
        <StyledTabs
          defaultActiveKey="total"
          activeKey={activeTab}
          onChange={(activeKey: string) => handleTabClickEvent(activeKey)}
        >
          <StyledTabs.TabPane key="total" tab="Total" />
          {priceArea?.priceScenarios.map((scenario, index) => {
            return (
              <StyledTabs.TabPane
                key={scenario.externalId}
                tab={
                  <>
                    <StyledIcon type="Stop" color={pickChartColor(index)} />
                    {scenario.name}
                  </>
                }
              />
            );
          })}
        </StyledTabs>
      </PriceScenariosContainer>
      <StyledTable>
        {tableColumns && tableData && (
          <HeadlessTable
            tableHeader={tableColumns as Column<TableData>[]}
            tableData={tableData}
            className="price-scenario-table"
            defaultColumnSize={{ min: 70, width: 70, max: 140 }}
          />
        )}
      </StyledTable>
    </Main>
  );
};
