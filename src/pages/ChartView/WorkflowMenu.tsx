import { ReactNode } from 'react';
import { Menu } from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import { Chart } from 'models/chart/types';
import { duplicateWorkflow } from 'models/chart/updates';
import { trackUsage } from 'services/metrics';
import chartAtom from 'models/chart/atom';
import { makeDefaultTranslations } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations('Duplicate');

type Props = {
  chart: Chart;
  id: string;
  children?: ReactNode;
  translations?: typeof defaultTranslations;
};

export default function WorkflowMenu({
  id,
  chart,
  children,
  translations,
}: Props) {
  const { data: login } = useUserInfo();
  const [, setChart] = useRecoilState(chartAtom);
  const t = { ...defaultTranslations, ...translations };

  const wf = chart?.workflowCollection?.find((wfc) => wfc.id === id);

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
        <span>{t.Duplicate}</span>
      </Menu.Item>
      {children}
    </Menu>
  );
}
