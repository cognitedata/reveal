import { Data, PlotMouseEvent } from 'plotly.js';
import { SetStateAction, useEffect, useState } from 'react';
import { Datapoints, DoubleDatapoint, ExternalId } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';
import { pickChartColor } from 'utils/utils';
import { useMetrics } from '@cognite/metrics';
import { PriceArea } from '@cognite/power-ops-api-types';
import { TableData } from 'types';
import dayjs from 'dayjs';

import { TooltipCard, FlexRow, StyledPlot, StyledTitle } from './elements';
import { chartStyles, layout, Card } from './chartConfig';

interface TooltipOffset {
  top: number;
  left: number;
}
interface TooltipData {
  color: string | undefined;
  scenario: string;
  hour: string | undefined;
  price: Plotly.Datum;
  auctionMatrix: string;
  shop: string;
}

interface PriceScenariosChartProps {
  externalIds: ExternalId[] | undefined;
  priceArea: PriceArea;
  activeTab: string | number;
  changeTab: (tab: SetStateAction<string>) => void;
  tableData: TableData[];
}

export const PriceScenariosChart = ({
  externalIds,
  priceArea,
  activeTab,
  changeTab,
  tableData,
}: PriceScenariosChartProps) => {
  const metrics = useMetrics('price-scenarios');
  const { client } = useAuthContext();
  const [chartData, setChartData] = useState<Data[]>([{}]);
  const [hoverClass, setHoverClass] = useState<string>('');
  const [tooltipAlignClass, setTooltipAlignClass] =
    useState<string>('align-left');
  const [tooltipData, setTooltipData] = useState<TooltipData | undefined>();
  const [tooltipOffset, setTooltipOffset] = useState<TooltipOffset>({
    top: 0,
    left: 0,
  });

  const getPointOffset = (point: Plotly.PlotDatum): TooltipOffset => {
    const {
      xaxis,
      yaxis,
      data: {
        x: { [point.pointIndex]: x },
        y: { [point.pointIndex]: y },
      },
    } = point;

    if (!x || !y) return { left: 0, top: 0 };

    return {
      left: (xaxis as any).l2p(x.valueOf()),
      top: (yaxis as any).l2p(y),
    };
  };

  const getChartData = async () => {
    const bidDate = dayjs(priceArea.bidDate);

    const timeseries =
      externalIds &&
      ((await client?.datapoints.retrieve({
        items: externalIds,
        start: bidDate.startOf('day').valueOf(),
        end: bidDate.endOf('day').valueOf(),
      })) as Datapoints[]);

    const plotData = timeseries
      ? timeseries.map((ts, index) => {
          const xvals = ts.datapoints.map((dataPoint) => dataPoint.timestamp);
          const yvals = ts.datapoints.map((dataPoint) => {
            const newPoint = dataPoint as DoubleDatapoint;
            return newPoint.value;
          });

          const active = !(
            activeTab !== 'total' && activeTab !== ts.externalId
          );
          const opacity = active ? 1 : 0.1;

          const formattedData: Data = ts
            ? {
                x: xvals,
                y: yvals,
                type: 'scatter',
                mode: 'lines+markers',
                name: ts.externalId,
                text: priceArea?.priceScenarios[index]?.name,
                hoverinfo: 'none',
                line: { color: pickChartColor(index) },
                opacity,
              }
            : {};
          return formattedData;
        })
      : [];

    setChartData(plotData);
  };

  const handleChartClickEvent = (event: PlotMouseEvent) => {
    changeTab(event.points[0].data.name);
    metrics.track('click-chart-line', {
      priceScenarioExternalId: event.points[0].data.name,
    });
  };

  const handleChartHoverEvent = (event: PlotMouseEvent) => {
    const hour = event.points[0].pointIndex;
    const { index } = (event.points[0] as any).fullData;

    const offset = event.points[0]
      ? getPointOffset(event.points[0])
      : { top: 0, left: 0 };
    setTooltipOffset(offset);

    if (event.points[0].pointIndex >= event.points[0].data.x.length - 4) {
      setTooltipAlignClass('align-right');
    } else {
      setTooltipAlignClass('align-left');
    }

    setTooltipData({
      color: event.points[0].data.line.color?.toString(),
      scenario: event.points[0].data.text.toString(),
      hour: `${hour + 1}`,
      price: Math.round(Number(event.points[0].y) * 100) / 100,
      auctionMatrix: tableData[hour][`calc-${index}`]
        ? tableData[hour][`calc-${index}`].toString()
        : 'No data',
      shop: tableData[hour][`shop-${index}`]
        ? tableData[hour][`shop-${index}`].toString()
        : 'No data',
    });

    if (activeTab === 'total' || activeTab === event.points[0].data.name) {
      setHoverClass('hover');
    }
  };

  useEffect(() => {
    getChartData();
  }, [priceArea, externalIds, activeTab]);

  return (
    (chartData && (
      <>
        <StyledTitle level={5}>Price Scenarios</StyledTitle>
        {tooltipData && (
          <TooltipCard
            className={[hoverClass, tooltipAlignClass].join(' ')}
            style={{
              top: `${tooltipOffset.top}px`,
              left: `${tooltipOffset.left}px`,
            }}
          >
            <FlexRow>
              <Card title={tooltipData?.scenario} color={tooltipData?.color} />
              <Card title="Hour" value={tooltipData.hour} />
            </FlexRow>
            <FlexRow>
              <Card title="Shop" value={tooltipData.shop} />
              <Card title="Price" value={`${tooltipData.price} NOK`} />
              <Card title="Auction Matrix" value={tooltipData.auctionMatrix} />
            </FlexRow>
          </TooltipCard>
        )}
        <StyledPlot
          data-testid="plotly-chart"
          className="styled-plot"
          data={chartData}
          layout={layout}
          style={chartStyles}
          config={{
            responsive: true,
            displayModeBar: 'hover',
            modeBarButtons: [['zoomIn2d', 'zoomOut2d', 'resetScale2d']],
            displaylogo: false,
            scrollZoom: true,
          }}
          onClick={handleChartClickEvent}
          onHover={handleChartHoverEvent}
          onUnhover={() => setHoverClass('')}
        />
      </>
    )) ||
    null
  );
};
