import { Report } from 'domain/reportManager/internal/types';

export type ReportDetailProps = {
  reportId: Report['id'];
  onClose?: () => void;
};

export type UpdateReport = ({
  report,
  id,
}: {
  report: Partial<Report>;
  id: Report['id'];
}) => void;
