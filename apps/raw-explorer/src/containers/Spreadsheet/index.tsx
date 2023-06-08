import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import { useActiveTableContext } from '@raw-explorer/contexts';
import { useColumnType } from '@raw-explorer/hooks/profiling-service';
import { useTableData, useIsTableEmpty } from '@raw-explorer/hooks/table-data';

import { Colors, Icon, Flex, Loader } from '@cognite/cogs.js';

import { FilterBar } from './FilterBar';
import { Table } from './Table';

const Loading = styled.p<{ $visible: boolean }>`
  position: absolute;
  bottom: 24px;
  left: 50%;
  text-align: center;
  background-color: ${Colors['surface--interactive--toggled-default']};
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.5s linear 1s;
`;

export const Spreadsheet = (): JSX.Element => {
  const { t } = useTranslation();
  const { database, table } = useActiveTableContext();
  const {
    rows,
    filteredColumns,
    isLoading,
    isFetched,
    isFetching,
    hasNextPage,
    fetchNextPage,
    tableLastUpdatedTime,
  } = useTableData();
  const { isFetched: areTypesFetched } = useColumnType(database, table);

  const isEmpty = useIsTableEmpty(database, table);

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar
        key={`${database}_${table}`}
        isEmpty={isEmpty}
        areTypesFetched={areTypesFetched}
        hasActions={true}
        isTableLastUpdatedTimeFetched={isFetched}
        tableLastUpdatedTime={tableLastUpdatedTime}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Table
            isEmpty={isEmpty}
            rows={rows}
            columns={filteredColumns}
            onEndReach={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
          <Loading $visible={isFetched && isFetching}>
            <Icon type="Loader" size={12} css={{ marginRight: 8 }} />
            {t('spreadsheet-loading-more-data')}
          </Loading>
        </>
      )}
    </Flex>
  );
};
