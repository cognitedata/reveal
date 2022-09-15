import { Report } from 'domain/reportManager/internal/types';

export type ReportDetailProps = {
  report: Report;
  onClose?: () => void;
};
