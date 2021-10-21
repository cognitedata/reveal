import { Menu } from '@cognite/cogs.js';
import { convertTimeseriesToWorkflow } from 'models/chart/updates';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import { chartAtom } from 'models/chart/atom';

type Props = {
  id: string;
};
export default function TimeSeriesMenu({ id }: Props) {
  const { data: login } = useUserInfo();
  const [chart, setChart] = useRecoilState(chartAtom);

  const ts = chart?.timeSeriesCollection?.find((t) => t.id === id);

  if (!chart || !login?.id || !ts) {
    return null;
  }

  const convert = () =>
    setChart((oldChart) => convertTimeseriesToWorkflow(oldChart!, id));

  return (
    <Menu>
      <Menu.Item onClick={() => convert()} appendIcon="YAxis">
        <span>Convert to calculation</span>
      </Menu.Item>
    </Menu>
  );
}
