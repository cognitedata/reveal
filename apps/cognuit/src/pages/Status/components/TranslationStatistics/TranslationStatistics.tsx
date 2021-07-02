import { useState, FC, useMemo } from 'react';
import { Tabs } from '@cognite/cogs.js';
import { Line } from 'react-chartjs-2';
import { Source, TranslationStatisticsObject } from 'typings/interfaces';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { useSourceTranslationStatisticsQuery } from 'services/endpoints/sources/query';
import { ThirdPartySystems } from 'types/globalTypes';

import { Container, ChartContainer } from '../Heartbeats/elements';
import { DATE_RANGE_VALUES, DateRangeValueType } from '../../utils';

interface Props {
  dateRange: DateRangeValueType;
}

const TranslationStatistics: FC<Props> = ({ dateRange }) => {
  const [activeTabKey, setActiveTabKey] = useState<string>('psToOw');

  const timeRange = useMemo(() => {
    let timeRange = 'month';
    if (dateRange === DATE_RANGE_VALUES.lastDay) {
      timeRange = 'day';
    }
    if (dateRange === DATE_RANGE_VALUES.lastHour) {
      timeRange = 'hour';
    }
    return timeRange;
  }, [dateRange]);

  const { data: psData, isLoading: psLoading } =
    useSourceTranslationStatisticsQuery({
      source: Source.STUDIO,
      timeRange,
      enabled: activeTabKey === 'psToOw',
    });

  const { data: owData, isLoading: owLoading } =
    useSourceTranslationStatisticsQuery({
      source: Source.OPENWORKS,
      timeRange,
      enabled: activeTabKey === 'owToPs',
    });

  function onTabChange(key: string) {
    setActiveTabKey(key);
  }

  const renderChart = (type: string, data: TranslationStatisticsObject[]) => {
    const getFormattedData = () => ({
      labels: data.map((item) => item.timestamp),
      datasets: [
        {
          label: 'Total objects',
          fill: true,
          lineTension: 0.5,
          backgroundColor: 'rgba(74, 103, 251, 0.03)',
          borderColor: 'rgba(74, 103, 251, 1)',
          pointBorderColor: 'rgba(255,255,255,1)',
          pointBackgroundColor: 'rgba(74, 103, 251, 1)',
          pointBorderWidth: 2,
          pointRadius: 5,
          data: data.map((item) => item.total_objects),
        },
        {
          label: 'Successfully Translated',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgb(164, 178, 252)',
          borderColor: 'rgb(164, 178, 252)',
          pointBorderColor: 'rgba(255,255,255,1)',
          pointBackgroundColor: 'rgb(164, 178, 252)',
          pointBorderWidth: 2,
          pointRadius: 5,
          data: data.map((item) => item.successful),
        },
      ],
    });

    return (
      <ChartContainer key={type} xScroll={false}>
        {psLoading || owLoading ? (
          <EmptyTableMessage isLoading text="Loading" />
        ) : (
          <>
            {data.length > 0 ? (
              <Line
                data={getFormattedData()}
                options={{
                  scales: { xAxes: [{ type: 'time' }] },
                  yAxes: [{ ticks: { beginAtZero: true } }],
                }}
                height={90}
              />
            ) : (
              <EmptyTableMessage text="No data" />
            )}
          </>
        )}
      </ChartContainer>
    );
  };

  return (
    <Container>
      <Tabs defaultActiveKey="psToOw" onChange={onTabChange}>
        <Tabs.TabPane
          tab={`${ThirdPartySystems.PS} to ${ThirdPartySystems.OW}`}
          key="psToOw"
        >
          {renderChart('ps', psData)}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={`${ThirdPartySystems.OW} to ${ThirdPartySystems.PS}`}
          key="owToPs"
        >
          {renderChart('ow', owData)}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
};

export default TranslationStatistics;
