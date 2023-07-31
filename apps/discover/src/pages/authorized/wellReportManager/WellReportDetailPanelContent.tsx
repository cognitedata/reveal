import { ReportDetailPanelContent, ReportDetailProps } from '../report-manager';

export const WellReportDetailPanelContent = ({
  reportId,
  onClose,
}: ReportDetailProps) => {
  return <ReportDetailPanelContent reportId={reportId} onClose={onClose} />;
};
