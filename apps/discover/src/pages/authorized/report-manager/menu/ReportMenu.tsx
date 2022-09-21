import { adaptReportToDisplayReport } from 'domain/reportManager/internal/adapters/adaptReportToDisplayReport';
import { useReportPermissions } from 'domain/reportManager/internal/queries/useReportPermissions';
import { Report } from 'domain/reportManager/internal/types';

import { Icon, Menu, Flex, Label } from '@cognite/cogs.js';

import {
  ReportMenuItemWrapper,
  ReportMenuItemBody,
  ReportMenuItemDetail,
  ReportDetailColumn,
} from './elements';

export type ReportMenuNavTypes =
  | 'ALL'
  | 'RESOLVED'
  | 'CREATE_NEW'
  | 'OPEN_REPORT';

export type ReportMenuProps = {
  activeReports?: Report[];
  handleNavigation: (
    navigationType: ReportMenuNavTypes,
    reportId?: Report['id']
  ) => void;
};

type ReportMenuItemProps = {
  title: string;
  subtitle?: string;
  status: string;
  createdTime: string;
};

export const ReportMenuItem = ({
  title,
  subtitle,
  status,
  createdTime,
}: ReportMenuItemProps) => {
  return (
    <ReportMenuItemWrapper
      alignItems="flex-start"
      justifyContent="space-between"
    >
      <ReportDetailColumn direction="column">
        <Flex direction="column">
          <ReportMenuItemBody level={6} strong>
            {title}
          </ReportMenuItemBody>
          {subtitle && (
            <ReportMenuItemBody level={6} strong>
              {subtitle}
            </ReportMenuItemBody>
          )}
        </Flex>

        <ReportMenuItemDetail>Created: {createdTime}</ReportMenuItemDetail>
      </ReportDetailColumn>

      <Label size="small">{status}</Label>
    </ReportMenuItemWrapper>
  );
};

const ActiveReportsSection = ({
  activeReports,
  handleNavigation,
}: ReportMenuProps) => {
  if (!activeReports?.length) {
    return null;
  }
  return (
    <>
      <Menu.Divider />
      <Menu.Header>Reported Issues</Menu.Header>
      {activeReports
        .slice(0, 2)
        .map(adaptReportToDisplayReport)
        .map((report) => (
          <Menu.Item
            key={report.id}
            onClick={() => handleNavigation('OPEN_REPORT', report.id)}
          >
            <ReportMenuItem
              title={`${report.reportType} / ${report.reason}`}
              status={report.status}
              createdTime={report.displayCreatedTime!}
            />
          </Menu.Item>
        ))}
      <Menu.Item
        appendIcon="ArrowRight"
        onClick={() => handleNavigation('ALL')}
      >
        See all reports
      </Menu.Item>
      <Menu.Item
        appendIcon="ArrowRight"
        onClick={() => handleNavigation('RESOLVED')}
      >
        <Icon type="Checklist" />
        Resolved Issues
      </Menu.Item>
    </>
  );
};

export const ReportMenu = ({
  activeReports,
  handleNavigation,
}: ReportMenuProps) => {
  const { canReadReports, canWriteReports } = useReportPermissions();
  return (
    <Menu>
      <Menu.Item
        onClick={() => handleNavigation('CREATE_NEW')}
        disabled={!canWriteReports}
        title={
          !canWriteReports ? 'You do not have permission to create reports' : ''
        }
      >
        <Icon type="Feedback" />
        Report new issues
      </Menu.Item>
      {canReadReports && (
        <ActiveReportsSection
          activeReports={activeReports}
          handleNavigation={handleNavigation}
        />
      )}
    </Menu>
  );
};
