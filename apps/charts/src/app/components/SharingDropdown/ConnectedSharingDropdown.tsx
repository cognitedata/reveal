import { ComponentProps, PropsWithChildren } from 'react';

import { useComponentTranslations } from '@charts-app/hooks/translations';
import { useIsChartOwner } from '@charts-app/hooks/user';
import chartAtom from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import { useRecoilState } from 'recoil';

import { Dropdown } from '@cognite/cogs.js';

import SharingDropdown from './SharingDropdown';

type Props = {
  popperOptions?: ComponentProps<typeof Dropdown>['popperOptions'];
  children?: ComponentProps<typeof Dropdown>['children'];
};

const ConnectedSharingDropdown = ({
  popperOptions,
  ...rest
}: PropsWithChildren<Props>) => {
  const [chart, setChart] = useRecoilState(chartAtom);
  const isOwner = useIsChartOwner(chart);
  if (!chart) throw new Error('No Chart Present!');

  const handleToggleChartAccess = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setChart((oldChart) => ({
      ...oldChart!,
      public: event.target.checked,
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
      popperOptions={popperOptions}
      {...rest}
    />
  );
};

export default ConnectedSharingDropdown;
