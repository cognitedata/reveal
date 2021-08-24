import { ReactNode } from 'react';
import { Menu } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import { duplicateWorkflow } from 'utils/charts';
import { trackUsage } from 'utils/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';

type Props = {
  chart: Chart;
  id: string;
  children?: ReactNode;
};

export default function WorkflowMenu({ id, chart, children }: Props) {
  const { data: login } = useUserInfo();
  const [, setChart] = useRecoilState(chartState);

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
