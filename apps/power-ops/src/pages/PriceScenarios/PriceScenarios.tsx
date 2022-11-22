import * as Sentry from '@sentry/browser';
import { PriceScenariosChart } from 'components/PriceScenariosChart';
import { SetStateAction, useEffect, useState } from 'react';
import { pickChartColor } from 'utils/utils';
import { BidProcessResultWithData, TableData, TableColumn } from 'types';
import { Column } from 'react-table';
import { HeadlessTable } from 'components/HeadlessTable';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import {
  DoubleDatapoint,
  SyntheticDatapoint,
  SyntheticDataValue,
} from '@cognite/sdk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import zip from 'lodash/zip';
import chunk from 'lodash/chunk';
import { useMetrics } from '@cognite/metrics';
import { DEFAULT_CONFIG } from '@cognite/power-ops-api-types';

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

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  bidProcessResult: BidProcessResultWithData;
}

const defaultColumnOptions = { minWidth: 70, width: 70, maxWidth: 140 };

export const PriceScenarios = ({ bidProcessResult }: Props) => {
  const metrics = useMetrics('price-scenarios');
  const { client } = useAuthenticatedAuthContext();
  const bidDate = dayjs(bidProcessResult.bidDate).tz(
    bidProcessResult.marketConfiguration?.timezone || DEFAULT_CONFIG.TIME_ZONE
  );

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

  const getTotalProductionData = async (): Promise<
    Record<string, string>[][]
  > => {
    // When "Total" tab is selected, table looks like:
    // [Hour, Scenario 1, Scenario 2, ..., Scenario n]

    // We need to split the scenario in max 10 element arrays due to a bug in the SDK
    // Ref: https://cognitedata.slack.com/archives/C6KNJCEEA/p1663773050949699
    const scenarioChunks = chunk(bidProcessResult.priceScenarios, 10);

    const shopTotalProductionDatapoints = (
      await Promise.all(
        scenarioChunks.map((scenarios) => {
          // Aggregate synthetically all total SHOP timeseries per Scenario for a given day (24h)
          return client.timeseries.syntheticQuery(
            scenarios.map((scenario) => ({
              expression: scenario.totalProduction.shopProductionExternalIds
                .map((externalId) => `TS{externalId='${externalId}'}`)
                .join(' + '),
              start: bidDate.startOf('day').valueOf(),
              end: bidDate.endOf('day').valueOf(),
            }))
          );
        })
      )
    ).flat();

    if (!shopTotalProductionDatapoints) {
      Sentry.captureException(
        new Error(`No shopTotalProductionDatapoints found.`)
      );
      return [];
    }

    return bidProcessResult.priceScenarios
      .map((_, index) => {
        const accessor = `shop-${index}`;
        const datapoints = (
          shopTotalProductionDatapoints[index]
            ?.datapoints as SyntheticDatapoint[]
        )?.map((point) => ({
          ...point,
          // Multiply by (-1) all Total SHOP production for presentation
          value: (point as SyntheticDataValue).value * -1,
        }));

        return { datapoints, accessor };
      })
      .map(({ datapoints, accessor }) =>
        getFormattedProductionColumn(datapoints, accessor)
      );
  };

  const getScenarioProductionData = async (
    activeScenarioIndex: number
  ): Promise<Record<string, string>[][]> => {
    // When a "Scenario" tab is selected, table looks like:
    // [Hour, Total (for this scenario), Plant 1, Plant 2, ..., Plant n]

    // Get current scenario from activeScenarioIndex
    const currentScenario =
      bidProcessResult.priceScenarios[activeScenarioIndex];

    if (!currentScenario) {
      Sentry.captureException(
        new Error(
          `No currentScenario found in bidProcessResult object for activeScenarioIndex = ${activeScenarioIndex}.`
        )
      );
      return [];
    }

    // Create array of ProductionsTS externalIds for each plant column
    const plantProductionTsExternalIds: string[] = [];
    bidProcessResult.plants.forEach(async (column, index) => {
      // Get Plant from current scenario
      const plant = currentScenario.plantProduction?.[index];

      if (plant?.production?.shopProductionExternalIds) {
        plantProductionTsExternalIds.push(
          ...plant.production.shopProductionExternalIds
        );
      }
    });

    // Fetch data points of each plant's SHOP result for a given day (24h)
    const shopPlantProductionDatapoints = plantProductionTsExternalIds.length
      ? await client.datapoints.retrieve({
          items: plantProductionTsExternalIds.map((externalId) => {
            return { externalId };
          }),
          start: bidDate.startOf('day').valueOf(),
          end: bidDate.endOf('day').valueOf(),
        })
      : [];
    if (!shopPlantProductionDatapoints?.length) {
      Sentry.captureException(
        new Error(`No shopPlantProductionDatapoints found`)
      );
      return [];
    }

    // Aggregate synthetically all total SHOP timeseries of current Scenario for a give day (24h)
    const shopTotalProductionDatapoints =
      await client.timeseries.syntheticQuery([
        {
          expression: currentScenario.totalProduction.shopProductionExternalIds
            .map((externalId) => `TS{externalId='${externalId}'}`)
            .join(' + '),
          start: bidDate.startOf('day').valueOf(),
          end: bidDate.endOf('day').valueOf(),
        },
      ]);
    if (!shopTotalProductionDatapoints) {
      Sentry.captureException(
        new Error(`No shopPlantProductionDatapoints found`)
      );
      return [];
    }

    return [
      ...shopTotalProductionDatapoints,
      ...shopPlantProductionDatapoints,
    ]?.map(({ datapoints }, index) => {
      // Tabs look like: [Hour, Total, Scenario 1, Scenario 2, ..., Scenario n]
      // thus the use of "activeScenarioIndex" for the total column
      const accessor =
        index === 0 ? `shop-${activeScenarioIndex}` : `shop-plant-${index - 1}`;

      const convertedDatapoints = (datapoints as DoubleDatapoint[]).map(
        (point) => ({
          ...point,
          // Multiply by (-1) all Total SHOP production for presentation (leave Plants unchanged)
          value: accessor.includes('plant') ? point.value : point.value * -1,
        })
      );

      return getFormattedProductionColumn(convertedDatapoints, accessor);
    });
  };

  const getTableData = async () => {
    if (!bidProcessResult.priceScenarios.length) {
      Sentry.captureException(new Error(`No Price Scenarios found`));
      return;
    }

    const activeScenarioIndex = bidProcessResult.priceScenarios.findIndex(
      (scenario) => scenario.priceTsExternalId === activeTab
    );
    let shopProductionData: Record<string, string>[][] = [];

    if (activeTab === 'total') {
      shopProductionData = await getTotalProductionData();
    } else {
      shopProductionData = await getScenarioProductionData(activeScenarioIndex);
    }

    const priceTimeseries =
      activeTab === 'total'
        ? priceExternalIds &&
          (await client.datapoints.retrieve({
            items: priceExternalIds.map((externalId) => {
              return externalId;
            }),
            start: bidDate.startOf('day').valueOf(),
            end: bidDate.endOf('day').valueOf(),
          }))
        : bidProcessResult.priceScenarios[activeScenarioIndex] &&
          (await client.datapoints.retrieve({
            items: [
              {
                externalId:
                  bidProcessResult.priceScenarios[activeScenarioIndex]
                    .priceTsExternalId,
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
          bidProcessResult
        )
      : [];

    // Combine both SHOP and calculated production values
    const combinedData = [...shopProductionData, ...calcProductionData];

    // Transpose rows and columns
    const transposedColumns = zip(...combinedData);
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
    if (bidProcessResult?.priceScenarios) {
      const priceExternalIds = bidProcessResult.priceScenarios.map(
        (scenario) => {
          return { externalId: scenario.priceTsExternalId };
        }
      );
      setPriceExternalIds(priceExternalIds);
    }
  }, [activeTab, bidProcessResult]);

  useEffect(() => {
    const activeColumns = getActiveColumns(activeTab, bidProcessResult);
    setTableColumns(activeColumns as TableColumn[]);
    getTableData();
  }, [priceExternalIds]);

  return (
    <Main>
      <PriceScenariosContainer>
        <PriceScenariosChart
          bidProcessResult={bidProcessResult}
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
          {bidProcessResult?.priceScenarios.map((scenario, index) => {
            return (
              <StyledTabs.TabPane
                key={scenario.priceTsExternalId}
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
            columns={tableColumns as Column<TableData>[]}
            data={tableData}
            className="price-scenario-table"
            defaultColumn={defaultColumnOptions}
          />
        )}
      </StyledTable>
    </Main>
  );
};
