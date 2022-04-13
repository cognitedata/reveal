import { Data } from 'plotly.js';
import { useEffect, useState } from 'react';
import { DoubleDatapoint, IdEither } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';
import Plot from 'react-plotly.js';
import { PriceArea } from '@cognite/power-ops-api-types';

import { StyledTitle } from './elements';

export const PriceScenariosChart = ({
  externalIds,
  priceArea,
}: {
  externalIds: IdEither[] | undefined;
  priceArea: PriceArea;
}) => {
  const { client } = useAuthContext();

  const [chartData, setChartData] = useState<Data[]>([{}]);

  const layout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    autosize: true,
    height: 368,
    margin: {
      t: 30,
      b: 60,
      l: 60,
      r: 30,
      pad: 12,
    },
    showlegend: false,
    font: {
      family: 'Inter',
      size: 12,
    },
    xaxis: {
      autorange: true,
      color: 'rgba(0, 0, 0, 0.45)',
      gridcolor: '#E8E8E8',
      title: {
        text: 'Hour',
        font: {
          size: 10,
        },
      },
      fixedrange: true,
      showline: true,
      position: 0,
      linecolor: '#E8E8E8',
    },
    yaxis: {
      autorange: true,
      color: 'rgba(0, 0, 0, 0.45)',
      gridcolor: '#E8E8E8',
      title: {
        text: 'Price (NOK)',
        font: {
          size: 10,
        },
      },
      fixedrange: true,
    },
  };

  const chartStyles = {
    display: 'flex',
  };

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
            const formattedData: Data = seriesData
              ? {
                  x: xvals,
                  y: yvals,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: seriesData[0].id.toString(),
                  hovertemplate:
                    `<b>${priceArea?.priceScenarios[index].name}</b><br><br>` +
                    '%{yaxis.title.text}: %{y:.02f}<br>' +
                    '%{xaxis.title.text}: %{x}<br>' +
                    '<extra></extra>',
                  hoverlabel: {
                    bgcolor: '#ffffff',
                  },
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
  }, [priceArea, externalIds]);

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
        />
      </>
    )) ||
    null
  );
};
