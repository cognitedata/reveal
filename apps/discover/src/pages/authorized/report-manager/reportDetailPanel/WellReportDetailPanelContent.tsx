import { ReportDetailProps } from '../types';

import { ReportDetailPanelContent } from './ReportDetailPanelContent';

export const WellReportDetailPanelContent = ({
  report,
  onClose,
}: ReportDetailProps) => {
  return <ReportDetailPanelContent report={report} onClose={onClose} />;
};
