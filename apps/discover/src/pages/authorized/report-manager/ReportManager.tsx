import { useReportUpdateMutate } from 'domain/reportManager/internal/actions/useReportUpdateMutate';
import { useAllReportsQuery } from 'domain/reportManager/internal/queries/useReportsQuery';
import { Report } from 'domain/reportManager/internal/types';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';
import { useUserList } from 'domain/userManagementService/internal/queries/useUserList';

import * as React from 'react';

import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';
import { getSearchParamsFromCurrentUrl } from 'utils/url';
import { useSetUrlParams } from 'utils/url/setUrlParams';

import { showErrorMessage, showSuccessMessage } from 'components/Toast';

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
  const { data: reports, isLoading: isLoadingReports } = useAllReportsQuery();
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
  const { mutate: updateReport } = useReportUpdateMutate();
  const { data, isLoading, isAdmin } = useDataForReportManager({
    wellboreFilter: searchFilter,
  });
  const urlSetter = useSetUrlParams();

  const handleReportUpdate = async (
    report: Partial<Report>,
    id: Report['id']
  ) => {
    if (id) {
      updateReport({ id, report });
      showSuccessMessage('Report Updated');
    } else {
      showErrorMessage(`Error changing status for ${report.id}`);
    }
  };

  const handleSearchInputChange = (value: string | number) => {
    setSearchFilter(String(value));
    urlSetter(`${URL_PARAM_WELLBORE_FILTER}=${value}`, {
      preserveKeyFilters: [SORT_KEY, FILTER_KEY],
    });
  };

  // apply initial filter
  React.useLayoutEffect(() => {
    const params = getSearchParamsFromCurrentUrl();
    if (params[URL_PARAM_WELLBORE_FILTER]) {
      setSearchFilter(params[URL_PARAM_WELLBORE_FILTER]);
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
