import React from 'react';
import { Menu } from '@cognite/cogs.js';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { convertTimeseriesToWorkflow } from 'utils/charts';
import { useLoginStatus } from 'hooks';

type Props = {
  chartId: string;
  id: string;
};
export default function TimeSeriesMenu({ id, chartId }: Props) {
  const { data: login } = useLoginStatus();
  const { data: chart } = useChart(chartId);
  const { mutate } = useUpdateChart();

  const ts = chart?.timeSeriesCollection?.find((t) => t.id === id);

  if (!chart || !login?.user || !ts) {
    return null;
  }
  const convert = () => mutate(convertTimeseriesToWorkflow(chart, id));
  return (
    <Menu>
      <Menu.Item onClick={() => convert()} appendIcon="YAxis">
        <span>Convert to calculation</span>
      </Menu.Item>
    </Menu>
  );
}
