import { Body, Flex } from '@cognite/cogs.js';

import { ReportDetailProps } from '../types';

export const ReportDetail = ({ report }: ReportDetailProps) => {
  const details: Array<{ label: string; value: string }> = [
    { label: 'Wellbore', value: report.externalId },
    { label: 'Data type', value: report.reportType },
    { label: 'Issue', value: report.reason },
    { label: 'Status', value: report.status },
    { label: 'Description', value: report.description },
  ];
  return (
    <Flex direction="column" style={{ padding: '16px' }} gap={20}>
      {details.map((detail) => {
        return (
          <div key={`report-detail-${detail.value}`}>
            <Body level={2} strong style={{ marginBottom: '6px' }}>
              {detail.label}
            </Body>
            <Body level={2} style={{ color: 'var(--cogs-text-icon--medium)' }}>
              {detail.value}
            </Body>
          </div>
        );
      })}
    </Flex>
  );
};
