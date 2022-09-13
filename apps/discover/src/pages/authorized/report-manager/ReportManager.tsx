import { useReportUpdateMutate } from 'domain/reportManager/internal/actions/useReportUpdateMutate';
import { useAllReportsQuery } from 'domain/reportManager/internal/queries/useReportsQuery';
import { Report } from 'domain/reportManager/internal/types';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import * as React from 'react';

import { showErrorMessage, showSuccessMessage } from 'components/Toast';

import { ReportManagerList } from './ReportManagerList';
import { adaptReportsForList } from './ReportManagerList/adaptReportsForList';
import { TableReport } from './ReportManagerList/types';

export const ReportManager: React.FC = () => {
  const { data: roles } = useUserRoles();
  const { mutate: updateReport } = useReportUpdateMutate();
  const { data, isLoading, isFetching } = useAllReportsQuery();
  const [processedData, setProcessedData] = React.useState<TableReport[]>([]);

  const handleReportUpdate = async (
    report: Partial<Report>,
    id: Report['id']
  ) => {
    if (id) {
      updateReport({ id, report });
      showSuccessMessage('Report Updated');
    } else {
      showErrorMessage(`Error changing status for ${report.id}`);
    }
  };

  React.useEffect(() => {
    adaptReportsForList({ reports: data }).then((data) =>
      setProcessedData(data)
    );
  }, [data, isFetching]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ReportManagerList
        data={processedData}
        isAdmin={roles?.isAdmin}
        onReportUpdate={handleReportUpdate}
      />
    </>
  );
};
