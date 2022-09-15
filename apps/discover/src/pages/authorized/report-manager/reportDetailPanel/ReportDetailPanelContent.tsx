import { ReportDetailProps } from '../types';

import { ReportDetailHeader } from './Header';
import { ReportDetailContainer } from './ReportDetailContainer';

export const ReportDetailPanelContent = ({
  report,
  onClose,
}: ReportDetailProps) => {
  return (
    <>
      <ReportDetailHeader onClose={onClose!} />
      <ReportDetailContainer report={report} />
    </>
  );
};
