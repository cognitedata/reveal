import { ReactNode } from 'react';
import { Menu } from '@cognite/cogs.js';
import { Chart } from 'models/chart/types';
import { duplicateWorkflow } from 'models/chart/updates';
import { trackUsage } from 'services/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import { chartAtom } from 'models/chart/atom';

type Props = {
  chart: Chart;
  id: string;
  children?: ReactNode;
};

export default function WorkflowMenu({ id, chart, children }: Props) {
  const { data: login } = useUserInfo();
  const [, setChart] = useRecoilState(chartAtom);

  const wf = chart?.workflowCollection?.find((t) => t.id === id);

  if (!login?.id || !wf) {
    return null;
  }
  const duplicate = () => {
    setChart((oldChart) => duplicateWorkflow(oldChart!, id));
    trackUsage('ChartView.DuplicateCalculation');
  };

  return (
    <Menu>
      <Menu.Item onClick={() => duplicate()} appendIcon="Duplicate">
        <span>Duplicate</span>
      </Menu.Item>
      {children}
    </Menu>
  );
}
