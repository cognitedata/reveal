import { Report } from 'domain/reportManager/internal/types';

import { Icon, Menu, Flex, Label } from '@cognite/cogs.js';

import {
  ReportMenuItemWrapper,
  ReportMenuItemBody,
  ReportMenuItemDetail,
} from './elements';

export type ReportMenuProps = {
  activeReports?: Report[];
  handleNavigation: () => void;
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
      <Flex direction="column">
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
      </Flex>

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
      <Menu.Header>Reported Issues</Menu.Header>
      {activeReports.map((report) => (
        <Menu.Item
          key={report.id}
          onClick={() => {
            handleNavigation();
          }}
        >
          <ReportMenuItem
            title={`${report.reportType} / ${report.reason}`}
            status={report.status}
            createdTime={new Date(report.createdTime!).toDateString()}
          />
        </Menu.Item>
      ))}
    </>
  );
};

export const ReportMenu = ({
  activeReports,
  handleNavigation,
}: ReportMenuProps) => {
  return (
    <Menu>
      <ActiveReportsSection
        activeReports={activeReports}
        handleNavigation={handleNavigation}
      />
      <Menu.Item appendIcon="ArrowRight" onClick={() => handleNavigation()}>
        See all reports
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <Icon type="Feedback" />
        Report new issues
      </Menu.Item>
      <Menu.Item appendIcon="ArrowRight">
        <Icon type="Checklist" />
        Resolved Issues
      </Menu.Item>
    </Menu>
  );
};
