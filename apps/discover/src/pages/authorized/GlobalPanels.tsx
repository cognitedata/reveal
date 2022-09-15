import { useDispatch } from 'react-redux';

import { hideGlobalSidePanel } from 'modules/global/reducer';
import { useGlobalSidePanel } from 'modules/global/selectors';

import { WellReportDetailPanelContent } from './report-manager/reportDetailPanel/WellReportDetailPanelContent';

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
            report={sidePanel.data}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  }
  return null;
};
