import { useMemo, useState } from 'react';
import { AutoResizer } from 'react-base-table';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import {
  useQuickProfile,
  useFullProfile,
  ColumnProfile,
} from '@transformations/hooks/profiling-service';
import { useFilteredColumns } from '@transformations/hooks/table-filters';
import { Alert } from 'antd';
import { sortBy } from 'lodash';

import { Flex, Icon } from '@cognite/cogs.js';

import ProfileRow from './ProfileRow';
import ProfileTableHeader from './ProfileTableHeader';

export type SortableColumn = keyof ColumnProfile;

type ProfilingProps = {
  database: string;
  table: string;
};

export const Profiling = ({ database, table }: ProfilingProps): JSX.Element => {
  const { t } = useTranslation();

  const fullProfile = useFullProfile({
    database,
    table,
  });

  const limitProfile = useQuickProfile({
    database,
    table,
  });

  const {
    data = { columns: [], rowCount: 0, isComplete: false },
    isInitialLoading,
    isError,
    error,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const [sortKey, _setSortKey] = useState<SortableColumn>('label');
  const [sortReversed, _setSortReversed] = useState(false);

  const setSortKey = (key: SortableColumn) => {
    const reverse = sortKey === key;
    _setSortKey(key);
    if (reverse) {
      _setSortReversed(!sortReversed);
    }
  };

  const filteredColumns = useFilteredColumns(database, table, data.columns);

  const columnList = useMemo(() => {
    const columns = sortBy(filteredColumns, sortKey);
    if (sortReversed) {
      return columns.reverse();
    }
    return columns;
  }, [filteredColumns, sortKey, sortReversed]);

  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }

  if (isError) {
    return (
      <div>
        <Alert
          type="error"
          message={t('profiling-service-error')}
          description={JSON.stringify(error, null, 2)}
        />
      </div>
    );
  }

  return (
    <Flex style={{ width: '100%', height: '100%' }}>
      <AutoResizer>
        {({ width, height }) => (
          <div style={{ width, height, overflow: 'scroll' }}>
            <Table>
              <ProfileTableHeader
                sortKey={sortKey}
                setSortKey={setSortKey}
                sortReversed={sortReversed}
                setSortReversed={_setSortReversed}
              />
              <tbody>
                {columnList.map((column) => (
                  <ProfileRow
                    key={column.label}
                    database={database}
                    table={table}
                    allCount={data.rowCount}
                    profile={column}
                  />
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </AutoResizer>
    </Flex>
  );
};

const Table = styled.table`
  position: relative;
  margin: 0;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;
