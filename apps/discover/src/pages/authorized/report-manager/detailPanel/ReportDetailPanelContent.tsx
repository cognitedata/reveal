import { ReportDetailProps } from '../types';

import { ReportDetailHeader } from './Header';
import { ReportDetailContainer } from './ReportDetailContainer';

export const ReportDetailPanelContent = ({
  reportId,
  onClose,
}: ReportDetailProps) => {
  return (
    <>
      <ReportDetailHeader onClose={onClose!} />
      <ReportDetailContainer reportId={reportId} />
    </>
  );
};
