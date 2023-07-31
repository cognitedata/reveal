import { showSuccessMessage, showErrorMessage } from 'components/Toast';

import { Report } from '../types';

import { useReportUpdateMutate } from './useReportUpdateMutate';

export const useUpdateReport = () => {
  const { mutate: updateReport } = useReportUpdateMutate();

  return async ({
    report,
    id,
  }: {
    report: Partial<Report>;
    id: Report['id'];
  }) => {
    if (id) {
      updateReport({ id, report });
      showSuccessMessage('Report Updated');
    } else {
      showErrorMessage(`Error changing status for ${report.id}`);
    }
  };
};
