import { showSuccessMessage, showErrorMessage } from 'components/Toast';

import { Report } from '../types';

import { useReportCreateMutate } from './useReportCreateMutate';

export const useCreateReport = () => {
  const { mutateAsync: createReport } = useReportCreateMutate();

  return async (report: Report[]) => {
    showSuccessMessage('Creating Report');
    try {
      await createReport(report);
      showSuccessMessage('Report created!');
    } catch (error) {
      showErrorMessage('Could not create report!');
    }
  };
};
