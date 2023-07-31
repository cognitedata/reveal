import {
  DATA_SETS_MAP,
  REPORT_STATUS,
  REPORT_FEEDBACK_REASONS,
} from '../constants';
import { Report, DisplayReport } from '../types';

export const adaptReportToDisplayReport = (report: Report): DisplayReport => {
  return {
    ...report,
    status: REPORT_STATUS[report.status],
    reason: REPORT_FEEDBACK_REASONS[report.reason],
    reportType: DATA_SETS_MAP[report.reportType],
  };
};
