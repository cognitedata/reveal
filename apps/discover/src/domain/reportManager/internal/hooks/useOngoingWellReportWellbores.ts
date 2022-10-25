import { EMPTY_ARRAY } from 'constants/empty';

import { useActiveReportsQuery } from '../queries/useActiveReportsQuery';

export const useOngoingWellReportWellbores = (): string[] => {
  const { data: activeReports, isLoading } = useActiveReportsQuery();

  if (isLoading || !activeReports) {
    return EMPTY_ARRAY;
  }

  return activeReports.reduce((list: string[], current) => {
    if (!list.includes(current.externalId)) {
      return [...list, current.externalId];
    }
    return list;
  }, []);
};
