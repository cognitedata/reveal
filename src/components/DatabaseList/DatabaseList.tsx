import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, Spin } from 'antd';
import { Button } from '@cognite/cogs.js';
import Alert from 'antd/lib/alert';
import { stringContains } from 'utils/typedUtils';
import { stringCompare } from 'utils/utils';
import styled from 'styled-components';
import useLocalStorage from 'hooks/useLocalStorage';
import { useDatabases } from 'hooks/sdk-queries';
import { RawDB } from '@cognite/sdk';
import CreateDatabase from 'components/CreateDatabase/CreateDatabase';
import DatabaseItem from './DatabaseItem';

const { Search } = Input;

interface DatabaseListProps {
  database?: string;
  table?: string;
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

const DatabaseList = ({ database }: DatabaseListProps) => {
  const {
    data: dbList,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useDatabases();

  useEffect(() => {
    if (hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, fetchNextPage]);

  const [searchWord, setSearch] = useState<string>('');

  const [sortingType, setSortingType] = useLocalStorage<SortingType>(
    'raw-sort',
    'name-asc'
  );

  const dbs = useMemo(
    () =>
      dbList
        ? dbList.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDB[]
          )
        : ([] as RawDB[]),
    [dbList]
  );

  const renderDatabaseList = () => {
    const newList = dbs
      .filter((_database) => stringContains(_database.name, searchWord))
      .sort((a, b) => {
        switch (sortingType) {
          case 'name-asc':
            return stringCompare(b.name, a.name);
          case 'name-desc':
            return stringCompare(a.name, b.name);
          default:
            return stringCompare(b.name, a.name);
        }
      });

    if (newList.length)
      return newList.map((item: RawDB) => (
        <DatabaseItem
          database={item.name}
          openItem={item.name === database}
          key={item.name}
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
      <CreateDatabase />

      <StyledSearch
        placeholder="Filter databases"
        onChange={(e) => setSearch(e.currentTarget.value)}
        onSearch={(value) => setSearch(value)}
        style={{ width: '100%' }}
        allowClear
      />
      <Spin spinning={isLoading}>
        {dbs.length > 0 ? (
          renderDatabaseList()
        ) : (
          <Alert message="Project contains no databases" type="info" showIcon />
        )}
      </Spin>
    </StyledCard>
  );
};

export default DatabaseList;
