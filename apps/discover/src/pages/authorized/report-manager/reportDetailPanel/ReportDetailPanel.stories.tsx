import { Report } from 'domain/reportManager/internal/types';

import { ReportDetailPanelContent } from './ReportDetailPanelContent';

const story = {
  title: 'Report Detail Panel / SidePanel',
  component: ReportDetailPanelContent,
};

const ACTIVE_REPORTS: Report = {
  status: 'ACTIVE',
  description: 'The NDS data was not sufficient for this wellbore',
  reason: 'Insufficient Data',
  reportType: 'NDS EVent',
  startTime: Date.now(),
  externalId: 'wells/andromeda/well-AND15661828/wellbores/wb-01',
  ownerUserId: '23',
};

export const basic = () => (
  <div style={{ height: '600px' }}>
    <ReportDetailPanelContent report={ACTIVE_REPORTS} />
  </div>
);

export default story;
