import { useMetrics } from '@cognite/metrics';
import { CommonSidebar } from 'components/CommonSidebar/CommonSidebar';

import { RKOMSidebar } from './RKOMSidebar';

type Props = {
  open: boolean;
  onOpenClose: (open: boolean) => void;
};

const RKOMSidebarContainer = ({ open, onOpenClose }: Props) => {
  const metrics = useMetrics('rkom');

  return (
    <CommonSidebar
      open={open}
      onOpenCloseClick={() => {
        metrics.track(`click-${open ? 'close' : 'open'}-rkom-sidebar`);
        onOpenClose(!open);
      }}
    >
      <RKOMSidebar
        onNavigate={(section) => {
          metrics.track('click-rkom-sidebar-link', {
            selected: section,
          });
        }}
      />
    </CommonSidebar>
  );
};

export default RKOMSidebarContainer;
