import { useUpdateReport } from 'domain/reportManager/internal/actions/useUpdateReport';
import { useReportsQuery } from 'domain/reportManager/internal/queries/useReportsQuery';
import { Report } from 'domain/reportManager/internal/types';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';
import { useUserList } from 'domain/userManagementService/internal/queries/useUserList';

import * as React from 'react';

import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';
import { getSearchParamsFromCurrentUrl } from 'utils/url';
import { useSetUrlParams } from 'utils/url/setUrlParams';

import { ReportManagerList } from './list';
import { adaptReportsForList } from './list/adaptReportsForList';
import { URL_PARAM_WELLBORE_FILTER } from './list/constants';
import { DebouncedInput } from './list/DebouncedInput';
import { TableReport } from './list/types';
import { FILTER_KEY, SORT_KEY } from './list/urlState';

export const FilterContainer = styled.div`
  padding: 20px;
  padding-bottom: 0px;
  svg {
    color: var(--cogs-text-icon--interactive--disabled);
  }
`;

const getUserIdsFromReports = (reports: Report[]) =>
  uniq(reports?.map((report) => report.ownerUserId));

const useDataForReportManager = ({
  wellboreFilter,
}: {
  wellboreFilter: string;
}) => {
  const { data: roles, isLoading: isLoadingRoles } = useUserRoles();
  const { data: reports, isLoading: isLoadingReports } = useReportsQuery();
  const { data: users } = useUserList({
    ids: getUserIdsFromReports(reports || []),
  });
  const [processedData, setProcessedData] = React.useState<TableReport[]>([]);

  React.useEffect(() => {
    adaptReportsForList({ reports, users }).then((data) => {
      const filteredData = wellboreFilter
        ? data.filter((item) => {
            return item.externalId
              ?.toLowerCase()
              ?.includes(wellboreFilter.toLowerCase());
          })
        : data;

      setProcessedData(filteredData);
    });
  }, [reports, users, wellboreFilter]);

  return {
    data: processedData,
    isLoading: isLoadingReports || isLoadingRoles,
    isAdmin: roles?.isAdmin,
  };
};

export const ReportManager: React.FC = () => {
  const [searchFilter, setSearchFilter] = React.useState('');

  const handleReportUpdate = useUpdateReport();

  const { data, isLoading, isAdmin } = useDataForReportManager({
    wellboreFilter: searchFilter,
  });

  const urlSetter = useSetUrlParams();

  const handleSearchInputChange = (value: string | number) => {
    setSearchFilter(String(value));
    urlSetter(`${URL_PARAM_WELLBORE_FILTER}=${encodeURIComponent(value)}`, {
      preserveKeyFilters: [SORT_KEY, FILTER_KEY],
    });
  };

  // apply initial filter
  React.useLayoutEffect(() => {
    const params = getSearchParamsFromCurrentUrl();
    if (params[URL_PARAM_WELLBORE_FILTER]) {
      setSearchFilter(decodeURIComponent(params[URL_PARAM_WELLBORE_FILTER]));
    }
  }, []);

  // loading is so fast we don't want to show anything
  if (isLoading) {
    return null;
  }

  return (
    <>
      <FilterContainer>
        <DebouncedInput
          clearable={{ callback: () => handleSearchInputChange('') }}
          value={searchFilter}
          onChange={handleSearchInputChange}
          placeholder="Search wellbores"
          icon="Search"
        />
      </FilterContainer>
      <ReportManagerList
        data={data}
        isAdmin={isAdmin}
        onReportUpdate={handleReportUpdate}
      />
    </>
  );
};
