import { Report } from 'domain/reportManager/internal/types';

import { ReportMenu } from './ReportMenu';

const story = {
  title: 'Report Manager / Menu',
  component: ReportMenu,
};

const ACTIVE_REPORTS: Report[] = [
  {
    status: 'BACKLOG',
    description: 'The NDS data was not sufficient for this wellbore',
    reason: 'INCOMPLETE',
    reportType: 'NDS',
    startTime: Date.now(),
    externalId: 'wells/andromeda/well-AND15661828/wellbores/wb-01',
    ownerUserId: '23',
  },
  {
    id: 123,
    status: 'IN_PROGRESS',
    description: 'The NDS data was not sufficient for this wellbore',
    reason: 'INCOMPLETE',
    reportType: 'NDS',
    startTime: Date.now(),
    externalId: 'wells/andromeda/well-AND15661828/wellbores/wb-01',
    ownerUserId: '23',
  },
];

export const basic = () => {
  return (
    <div style={{ height: '600px' }}>
      <ReportMenu
        activeReports={ACTIVE_REPORTS}
        handleNavigation={() => {
          console.log('navigating to report panel');
        }}
      />
    </div>
  );
};
export default story;
