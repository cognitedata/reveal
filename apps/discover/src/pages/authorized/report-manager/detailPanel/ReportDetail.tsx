import { useUpdateReport } from 'domain/reportManager/internal/actions/useUpdateReport';
import { adaptReportToDisplayReport } from 'domain/reportManager/internal/adapters/adaptReportToDisplayReport';
import { useReportsQuery } from 'domain/reportManager/internal/queries/useReportsQuery';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import { Body, Flex } from '@cognite/cogs.js';

import { StatusSelector } from '../statusSelector';
import { ReportDetailProps } from '../types';

export const ReportDetail = ({ reportId }: ReportDetailProps) => {
  const handleReportUpdate = useUpdateReport();
  const { data: roles } = useUserRoles();
  const { data: reports } = useReportsQuery([reportId]);
  const report = reports?.[0];

  if (!report) {
    return null;
  }

  const displayReport = adaptReportToDisplayReport(report);

  const details: Array<{ label: string; value: string }> = [
    { label: 'Wellbore', value: displayReport.externalId },
    { label: 'Data type', value: displayReport.reportType },
    { label: 'Issue', value: displayReport.reason },
    { label: 'Status', value: displayReport.status },
    { label: 'Description', value: displayReport.description },
  ];

  return (
    <Flex direction="column" style={{ padding: '16px' }} gap={20}>
      {details.map(({ label, value }) => {
        if (label === 'Status') {
          return (
            <div key={`report-detail-${value}`}>
              <Body level={2} strong style={{ marginBottom: '6px' }}>
                {label}
              </Body>
              <StatusSelector
                id={displayReport.id}
                value={displayReport.status}
                onReportUpdate={handleReportUpdate}
                isAdmin={roles?.isAdmin}
              />
            </div>
          );
        }
        return (
          <div key={`report-detail-${value}`}>
            <Body level={2} strong style={{ marginBottom: '6px' }}>
              {label}
            </Body>
            <Body level={2} style={{ color: 'var(--cogs-text-icon--medium)' }}>
              {value}
            </Body>
          </div>
        );
      })}
    </Flex>
  );
};
