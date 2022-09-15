import { DATA_SETS_MAP } from 'domain/reportManager/internal/constants';
import { useActiveReportsQuery } from 'domain/reportManager/internal/queries/useActiveReportsQuery';

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import navigation from 'constants/navigation';
import { showGlobalSidePanel } from 'modules/global/reducer';
import { wellInspectActions } from 'modules/wellInspect/actions';

import { ReportMenu, ReportMenuProps } from './ReportMenu';

export type WellReportMenuProps = {
  wellboreMatchingId: string;
  dataSet?: keyof typeof DATA_SETS_MAP;
};

export const WellReportMenu = ({
  wellboreMatchingId,
  dataSet,
}: WellReportMenuProps) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleNavigation: ReportMenuProps['handleNavigation'] = (
    navigationType,
    report
  ) => {
    switch (navigationType) {
      case 'ALL':
        history.push(navigation.REPORT_PANEL);
        break;
      case 'CREATE_NEW':
        dispatch(
          wellInspectActions.setWellFeedback({
            visible: true,
            wellboreMatchingId,
            dataSet,
          })
        );
        break;
      case 'OPEN_REPORT':
        dispatch(showGlobalSidePanel({ data: report!, type: 'WELL_REPORT' }));
        break;
      case 'RESOLVED':
        history.push(navigation.REPORT_PANEL);
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
