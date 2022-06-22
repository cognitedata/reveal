import { useComponentTranslations } from 'hooks/translations';
import { useIsChartOwner } from 'hooks/user';
import chartAtom from 'models/chart/atom';
import { useRecoilState } from 'recoil';
import { trackUsage } from 'services/metrics';
import SharingDropdown from './SharingDropdown';

const ConnectedSharingDropdown = () => {
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
    />
  );
};

export default ConnectedSharingDropdown;
