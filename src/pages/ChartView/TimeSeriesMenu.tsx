import { Menu } from '@cognite/cogs.js';
import { convertTimeseriesToWorkflow } from 'utils/charts';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';

type Props = {
  id: string;
};
export default function TimeSeriesMenu({ id }: Props) {
  const { data: login } = useUserInfo();
  const chart = useRecoilValue(chartState);
  const setChart = useSetRecoilState(chartState);

  const ts = chart?.timeSeriesCollection?.find((t) => t.id === id);

  if (!chart || !login?.id || !ts) {
    return null;
  }
  const convert = () => setChart(convertTimeseriesToWorkflow(chart, id));
  return (
    <Menu>
      <Menu.Item onClick={() => convert()} appendIcon="YAxis">
        <span>Convert to calculation</span>
      </Menu.Item>
    </Menu>
  );
}
