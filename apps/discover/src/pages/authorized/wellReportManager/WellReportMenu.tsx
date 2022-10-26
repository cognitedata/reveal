import { DATA_SETS_MAP } from 'domain/reportManager/internal/constants';
import { useActiveReportsQuery } from 'domain/reportManager/internal/queries/useActiveReportsQuery';

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import navigation from 'constants/navigation';
import { showGlobalSidePanel } from 'modules/global/reducer';
import { reportManagerActions } from 'modules/report-manager/actions';

import { ReportMenu, ReportMenuProps } from '../report-manager';

export type WellReportMenuProps = {
  wellboreMatchingId: string;
  dataSet?: keyof typeof DATA_SETS_MAP;
  wellboreName?: string;
};

export const WellReportMenu = ({
  wellboreMatchingId,
  dataSet,
  wellboreName,
}: WellReportMenuProps) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleNavigation: ReportMenuProps['handleNavigation'] = (
    navigationType,
    reportId
  ) => {
    switch (navigationType) {
      case 'ALL':
        history.push({
          pathname: navigation.REPORT_PANEL,
          search: `?wellbores=${encodeURIComponent(
            wellboreName || wellboreMatchingId
          )}`,
        });
        break;
      case 'CREATE_NEW':
        dispatch(
          reportManagerActions.setWellFeedback({
            visible: true,
            wellboreMatchingId,
            dataSet,
          })
        );
        break;
      case 'OPEN_REPORT':
        dispatch(showGlobalSidePanel({ data: reportId, type: 'WELL_REPORT' }));
        break;
      case 'RESOLVED':
        history.push({
          pathname: navigation.REPORT_PANEL,
          search: `?filter_status=Resolved&wellbores=${encodeURIComponent(
            wellboreName || wellboreMatchingId
          )}`,
        });
        break;
    }
  };
  const { data: activeReports } = useActiveReportsQuery([wellboreMatchingId]);

  return (
    <ReportMenu
      activeReports={activeReports}
      handleNavigation={handleNavigation}
    />
  );
};
