import { useReportUpdateMutate } from 'domain/reportManager/internal/actions/useReportUpdateMutate';
import { useAllReportsQuery } from 'domain/reportManager/internal/queries/useReportsQuery';
import { Report } from 'domain/reportManager/internal/types';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';
import { useUserList } from 'domain/userManagementService/internal/queries/useUserList';

import * as React from 'react';

import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';

import { showErrorMessage, showSuccessMessage } from 'components/Toast';

import { ReportManagerList } from './list';
import { adaptReportsForList } from './list/adaptReportsForList';
import { DebouncedInput } from './list/DebouncedInput';
import { TableReport } from './list/types';

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
  const { data: roles } = useUserRoles();
  const { data: reports, isLoading } = useAllReportsQuery();
  const { data: users } = useUserList({
    ids: getUserIdsFromReports(reports || []),
  });
  const [processedData, setProcessedData] = React.useState<TableReport[]>([]);

  React.useEffect(() => {
    adaptReportsForList({ reports, users }).then((data) => {
      const filteredData = wellboreFilter
        ? data.filter((item) => {
            return item.externalId?.includes(wellboreFilter);
          })
        : data;

      setProcessedData(filteredData);
    });
  }, [reports, users, wellboreFilter]);

  return { data: processedData, isLoading, isAdmin: roles?.isAdmin };
};

export const ReportManager: React.FC = () => {
  const [searchFilter, setSearchFilter] = React.useState('');
  const { mutate: updateReport } = useReportUpdateMutate();
  const { data, isLoading, isAdmin } = useDataForReportManager({
    wellboreFilter: searchFilter,
  });

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <FilterContainer>
        <DebouncedInput
          value={searchFilter}
          onChange={(value) => setSearchFilter(value as string)}
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
