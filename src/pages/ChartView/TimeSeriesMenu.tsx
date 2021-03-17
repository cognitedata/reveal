import React from 'react';
import { Menu } from '@cognite/cogs.js';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { ChartTimeSeries } from 'reducers/charts/types';
import {
  updateTimeseries,
  removeTimeseries,
  convertTimeseriesToWorkflow,
} from 'utils/charts';
import { useLoginStatus } from 'hooks';
import ToolsMenu from './ToolsMenu';

type Props = {
  chartId: string;
  id: string;
  closeMenu?: () => void;
};
export default function TimeSeriesMenu({ id, chartId, closeMenu }: Props) {
  const { data: login } = useLoginStatus();
  const { data: chart } = useChart(chartId);
  const { mutate } = useUpdateChart();

  const ts = chart?.timeSeriesCollection?.find((t) => t.id === id);

  if (!chart || !login?.user || !ts) {
    return null;
  }

  const update = (diff: Partial<ChartTimeSeries>, close: boolean = true) => {
    mutate({ chart: updateTimeseries(chart, id, diff) });
    if (closeMenu && close) {
      closeMenu();
    }
  };
  const remove = () => mutate({ chart: removeTimeseries(chart, id) });
  const convert = () =>
    mutate({ chart: convertTimeseriesToWorkflow(chart, id) });
  return (
    <Menu>
      <ToolsMenu update={update} />
      <Menu.Item
        onClick={() => {
          // eslint-disable-next-line no-alert
          const newName = prompt('Rename timeseries', ts.name);
          if (newName) {
            update({
              name: newName,
            });
          }
        }}
        appendIcon="Edit"
      >
        <span>Rename</span>
      </Menu.Item>
      <Menu.Item onClick={() => remove()} appendIcon="Delete">
        <span>Remove</span>
      </Menu.Item>
      <Menu.Item onClick={() => convert()} appendIcon="Timeseries">
        <span>Convert to calculation</span>
      </Menu.Item>
    </Menu>
  );
}
