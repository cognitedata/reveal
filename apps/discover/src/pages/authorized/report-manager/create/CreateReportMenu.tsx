import { useActiveReportsQuery } from 'domain/reportManager/internal/queries/useActiveReportsQuery';

import { useHistory } from 'react-router-dom';

import navigation from 'constants/navigation';

import { ReportMenu } from './ReportMenu';

export const CreateReportMenu = () => {
  const history = useHistory();
  const handleNavigation = () => {
    // todo(PP-3146): figure out how to navigate for admin separately
    history.push(navigation.REPORT_PANEL);
  };
  const { data: activeReports } = useActiveReportsQuery([
    'wells/andromeda/well-AND15661828/wellbores/wb-01',
  ]);

  return (
    <ReportMenu
      activeReports={activeReports}
      handleNavigation={handleNavigation}
    />
  );
};
