import { useDispatch } from 'react-redux';

import { hideGlobalSidePanel } from 'modules/global/reducer';
import { useGlobalSidePanel } from 'modules/global/selectors';

import { WellReportDetailPanelContent } from './wellReportManager/WellReportDetailPanelContent';

export const GlobalPanels = () => {
  const sidePanel = useGlobalSidePanel();
  const dispatch = useDispatch();
  const onClose = () => {
    dispatch(hideGlobalSidePanel());
  };

  if (sidePanel.visible) {
    switch (sidePanel.type) {
      case 'WELL_REPORT':
        return (
          <WellReportDetailPanelContent
            reportId={sidePanel.data}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  }
  return null;
};
