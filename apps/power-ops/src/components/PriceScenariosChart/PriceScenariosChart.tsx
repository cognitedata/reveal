import { Data } from 'plotly.js';
import { SetStateAction, useEffect, useState } from 'react';
import { DoubleDatapoint, IdEither } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';
import Plot from 'react-plotly.js';
import { pickChartColor } from 'utils/utils';
import { PieHoverInfo } from 'plotly.js/lib/traces/pie';
import { PriceArea } from '@cognite/power-ops-api-types';

import { StyledTitle } from './elements';
import { chartStyles, layout } from './chartConfig';

export const PriceScenariosChart = ({
  externalIds,
  priceArea,
  activeTab,
  changeTab,
}: {
  externalIds: IdEither[] | undefined;
  priceArea: PriceArea;
  activeTab: string | number;
  changeTab: (tab: SetStateAction<string>) => void;
}) => {
  const { client } = useAuthContext();
  const [chartData, setChartData] = useState<Data[]>([{}]);

  const getChartData = async () => {
    const timeseries =
      externalIds && (await client?.timeseries.retrieve(externalIds));

    const plotData = timeseries
      ? await Promise.all(
          timeseries.map(async (series, index) => {
            const seriesData = await client?.datapoints.retrieve({
              items: [{ id: series.id }],
            });
            const xvals =
              seriesData &&
              seriesData[0].datapoints.map((dataPoint) => dataPoint.timestamp);
            const yvals =
              seriesData &&
              seriesData[0].datapoints.map((dataPoint) => {
                const newPoint = dataPoint as DoubleDatapoint;
                return newPoint.value;
              });

            const active = !(
              activeTab !== 'total' && activeTab !== series.externalId
            );
            const opacity = active ? 1 : 0.4;
            const hoverinfo: PieHoverInfo = active ? 'all' : 'none';
            const hovertemplate = active
              ? `<b>${priceArea?.priceScenarios[index].name}</b><br><br>` +
                '%{yaxis.title.text}: %{y:.02f}<br>' +
                '%{xaxis.title.text}: %{x}<br>' +
                '<extra></extra>'
              : '';

            const formattedData: Data = seriesData
              ? {
                  x: xvals,
                  y: yvals,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: series.externalId,
                  hovertemplate,
                  hoverinfo,
                  line: { color: pickChartColor(index) },
                  opacity,
                }
              : {};
            return formattedData;
          })
        )
      : [];

    setChartData(plotData);
  };

  useEffect(() => {
    getChartData();
  }, [priceArea, externalIds, activeTab]);

  return (
    (chartData && (
      <>
        <StyledTitle level={5}>Price Scenarios</StyledTitle>
        <Plot
          data-testid="plotly-chart"
          className="styled-plot"
          data={chartData}
          layout={layout}
          style={chartStyles}
          config={{
            responsive: true,
            displayModeBar: false,
          }}
          onClick={(event) => changeTab(event.points[0].data.name)}
        />
      </>
    )) ||
    null
  );
};
