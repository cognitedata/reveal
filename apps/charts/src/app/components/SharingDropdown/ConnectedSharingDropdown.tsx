import { ComponentProps } from 'react';

import { useComponentTranslations } from '@charts-app/hooks/translations';
import { useIsChartOwner } from '@charts-app/hooks/user';
import chartAtom from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import { useRecoilState } from 'recoil';

import { Dropdown } from '@cognite/cogs.js';

import SharingDropdown from './SharingDropdown';

type Props = {
  label?: string | undefined;
  popperOptions?: ComponentProps<typeof Dropdown>['popperOptions'];
};

const ConnectedSharingDropdown = ({ label, popperOptions }: Props) => {
  const [chart, setChart] = useRecoilState(chartAtom);
  const isOwner = useIsChartOwner(chart);
  if (!chart) throw new Error('No Chart Present!');

  const handleToggleChartAccess = (newPublic: boolean) => {
    setChart((oldChart) => ({
      ...oldChart!,
      public: newPublic,
    }));

    trackUsage('ChartView.ChangeChartAccess', {
      state: chart.public ? 'public' : 'private',
    });
  };

  return (
    <SharingDropdown
      chart={{ name: chart.name, public: chart.public ?? false }}
      onToggleChartAccess={handleToggleChartAccess}
      disabled={!isOwner}
      translations={useComponentTranslations(SharingDropdown)}
      label={label}
      popperOptions={popperOptions}
    />
  );
};

export default ConnectedSharingDropdown;
