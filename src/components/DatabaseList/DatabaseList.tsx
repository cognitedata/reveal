import React, { useState, useEffect } from 'react';
import { Card, Input, Spin } from 'antd';
import { Button } from '@cognite/cogs.js';
import Alert from 'antd/lib/alert';
import { History } from 'history';
import { stringContains } from 'utils/typedUtils';
import { stringCompare } from 'utils/utils';
import styled from 'styled-components';
import useLocalStorage from 'hooks/useLocalStorage';
import DatabaseItem from './DatabaseItem';
import { DatabaseWithTablesItem } from '../RawFunctions/types';
import { getDatabasesWithTables } from '../RawFunctions';

const { Search } = Input;

interface DatabaseListProps {
  selectedTable: {
    database?: string;
    table?: string;
  };
  setSelectedTable(value: { database?: string; table?: string }): void;
  isFetching: boolean;
  setIsFetching(value: boolean): void;
  deleteDatabase(value: string): void;
  hasWriteAccess: boolean;
  setCreateModalVisible(value: boolean): void;
  openKeys: string[];
  setOpenKeys(values: string[]): void;
  history: History;
}

export type SortingType = 'name-asc' | 'name-desc';

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 0;
  }
`;

const StyledCardHeading = styled.div`
  position: sticky;
  border-bottom: 1px solid #d8d8d8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const StyledCardTitle = styled.h3`
  margin-bottom: 0;
`;

const StyledSearch = styled(Search)`
  margin-bottom: 8px;
`;

const DatabaseList = ({
  selectedTable,
  setSelectedTable,
  isFetching,
  setCreateModalVisible,
  history,
  openKeys,
  setIsFetching,
  hasWriteAccess,
  deleteDatabase,
  setOpenKeys,
}: DatabaseListProps) => {
  const [dbList, setDbList] = useState<DatabaseWithTablesItem[]>([]);
  const [searchWord, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sortingType, setSortingType] = useLocalStorage<SortingType>(
    'raw-sort',
    'name-asc'
  );

  const renderDatabaseList = () => {
    const newList = dbList
      .filter((database) => stringContains(database.database.name, searchWord))
      .sort((a, b) => {
        switch (sortingType) {
          case 'name-asc':
            return stringCompare(b.database.name, a.database.name);
          case 'name-desc':
            return stringCompare(a.database.name, b.database.name);
          default:
            return stringCompare(b.database.name, a.database.name);
        }
      });

    if (newList.length)
      return newList.map((item: DatabaseWithTablesItem) => (
        <DatabaseItem
          tables={item.tables}
          selectedTable={selectedTable}
          openKeys={openKeys}
          setOpenKeys={setOpenKeys}
          key={item.database.name}
          currentDatabase={item.database.name}
          setSelectedTable={setSelectedTable}
          setIsFetching={setIsFetching}
          isFetching={isFetching}
          deleteDatabase={deleteDatabase}
          hasWriteAccess={hasWriteAccess}
          history={history}
          sortingType={sortingType}
        />
      ));

    return (
      <Alert
        message="No database names match the filter query"
        type="info"
        showIcon
      />
    );
  };

  useEffect(() => {
    const fetchDatabaseList = async () => {
      setLoading(true);
      const list = await getDatabasesWithTables();
      setDbList(list);
      setLoading(false);
    };
    if (!isFetching) fetchDatabaseList();
  }, [isFetching]);

  const SortingButton = () => {
    const handleSortChange = () => {
      if (sortingType === 'name-asc') setSortingType('name-desc');
      else {
        setSortingType('name-asc');
      }
    };
    return (
      <Button
        icon={sortingType === 'name-asc' ? 'SortAlphaAsc' : 'SortAlphaDesc'}
        type="link"
        onClick={handleSortChange}
      >
        Sort
      </Button>
    );
  };
  return (
    <StyledCard
      style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
      bordered={false}
    >
      <StyledCardHeading>
        <StyledCardTitle>Databases</StyledCardTitle>
        <SortingButton />
      </StyledCardHeading>
      {hasWriteAccess && (
        <Button
          style={{ width: '100%', marginBottom: '5px' }}
          icon="PlusCompact"
          type="primary"
          onClick={() => setCreateModalVisible(true)}
          disabled={!hasWriteAccess}
        >
          Create Database
        </Button>
      )}
      <StyledSearch
        placeholder="Filter databases"
        onChange={(e) => setSearch(e.currentTarget.value)}
        onSearch={(value) => setSearch(value)}
        style={{ width: '100%' }}
        allowClear
      />
      <Spin spinning={loading}>
        {dbList.length > 0 ? (
          renderDatabaseList()
        ) : (
          <Alert message="Project contains no databases" type="info" showIcon />
        )}
      </Spin>
    </StyledCard>
  );
};

export default DatabaseList;
