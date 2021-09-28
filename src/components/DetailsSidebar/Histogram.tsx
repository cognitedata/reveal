import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { useRecoilValue } from 'recoil';
import { timeseriesSummaryById } from 'atoms/timeseries';
import { ChartTimeSeries } from 'reducers/charts/types';
import { convertValue } from 'utils/units';
import {
  getDisplayUnit,
  getHistogramRange,
} from 'components/DetailsSidebar/utils';

const Plot = createPlotlyComponent(Plotly);

export const Histogram = ({
  sourceItem,
  histogramData,
}: {
  sourceItem: ChartTimeSeries;
  histogramData: number[];
}) => {
  const { tsExternalId, unit, preferredUnit } = sourceItem;

  const summary = useRecoilValue(timeseriesSummaryById(tsExternalId));
  const convertedMin = convertValue(summary?.min!, unit, preferredUnit);
  const convertedMax = convertValue(summary?.max!, unit, preferredUnit);

  if (!histogramData?.length) {
    return <span>No data</span>;
  }

  return (
    <Plot
      data={[
        {
          type: 'bar',
          x: getHistogramRange(convertedMin, convertedMax, 10),
          y: histogramData,
          hoverinfo: 'y',
          hoverlabel: {
            bgcolor: '#ffffff',
            font: {
              color: '#333333',
            },
          },
        },
      ]}
      layout={{
        width: 300,
        height: 260,
        bargap: 0,
        margin: { l: 30, r: 30, t: 30, b: 80 },
        xaxis: {
          range: [convertedMin, convertedMax],
          tickvals: getHistogramRange(convertedMin, convertedMax, 10),
          ticks: 'outside',
          tickangle: 45,
          title: {
            text: `${getDisplayUnit(preferredUnit)}`,
            standoff: 50,
            font: {
              family: 'sans-serif',
            },
          },
        },
        dragmode: false,
      }}
      config={{ displayModeBar: false }}
    />
  );
};
