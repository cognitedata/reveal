import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import Chart, { ChartData, ChartConfiguration } from 'chart.js/auto';
import { Flex } from 'components/Common';

// @ts-ignore
Chart.defaults.datasets.doughnut.cutout = '75%';

type Props = {
  data: ChartData;
  label?: React.ReactNode;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export const DoughnutChart = (props: Props) => {
  const { data, label, height = 150, width = 150, style = {} } = props;
  const chartContainer = useRef<any>(null);
  const [chart, setChart] = useState<Chart | null>(null);

  const config: ChartConfiguration<any> = {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true, // temp
        },
      },
    },
  };

  useEffect(() => {
    if (!chartContainer?.current) return;
    const newChart = new Chart(chartContainer.current, config);
    setChart(newChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartContainer]);

  useEffect(() => {
    if (chart && !isEqual(chart.data, data)) {
      chart.data = data;
      chart.update('none');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Flex
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {label && (
        <Flex
          align
          justify
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        >
          <div style={{ width: `${width / 2}px`, height: `${height / 2}px` }}>
            {label}
          </div>
        </Flex>
      )}
      <canvas style={style} id="doughnutChart" ref={chartContainer} />
    </Flex>
  );
};
