import { Menu } from '@cognite/cogs.js';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { convertTimeseriesToWorkflow } from 'utils/charts';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';

type Props = {
  chartId: string;
  id: string;
};
export default function TimeSeriesMenu({ id, chartId }: Props) {
  const { data: login } = useUserInfo();
  const { data: chart } = useChart(chartId);
  const { mutate } = useUpdateChart();

  const ts = chart?.timeSeriesCollection?.find((t) => t.id === id);

  if (!chart || !login?.id || !ts) {
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
