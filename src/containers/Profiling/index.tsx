import React, { useMemo, useState } from 'react';
import { Alert } from 'antd';
import { sortBy } from 'lodash';
import styled from 'styled-components';
import { Flex, Loader, Title, Colors } from '@cognite/cogs.js';
import {
  ColumnProfile,
  useQuickProfile,
  useFullProfile,
} from 'hooks/profiling-service';
import { AutoResizer } from 'react-base-table';
import { useActiveTableContext } from 'contexts';
import ProfileRow from './ProfileRow';
import ProfileTableHeader from './ProfileTableHeader';

export type SortableColumn = keyof ColumnProfile;

export const Profiling = (): JSX.Element => {
  const { database, table } = useActiveTableContext();

  const fullProfile = useFullProfile({
    database,
    table,
  });

  const limitProfile = useQuickProfile({
    database,
    table,
  });

  const {
    data = { columns: [], rowCount: 0 },
    isLoading,
    isError,
    error,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const [sortKey, setSortKey] = useState<SortableColumn>('label');
  const [sortReversed, setSortReversed] = useState(false);

  const columnList = useMemo(() => {
    const columns = sortBy(data.columns, sortKey);
    if (sortReversed) {
      return columns.reverse();
    }
    return columns;
  }, [data.columns, sortKey, sortReversed]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div>
        <Alert
          type="error"
          message="Profiling service error"
          description={JSON.stringify(error, null, 2)}
        />
      </div>
    );
  }

  return (
    <RootFlex direction="column">
      <Title level={4}>Table summary</Title>
      <CardsFlex direction="row">
        <Card className="z-2">
          <header>Rows profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <div className="count">{data.rowCount}</div>
            <div
              className={`coverage ${fullProfile.isFetched ? '' : 'running'}`}
            >
              {fullProfile.isFetched ? '100%' : 'running...'}
            </div>
          </Flex>
        </Card>
        <Card className="z-2">
          <header>Columns profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <p className="count">{Object.values(data.columns).length}</p>
            <p className="coverage">100%</p>
          </Flex>
        </Card>
      </CardsFlex>
      <Flex style={{ width: '100%', height: '100%' }}>
        <AutoResizer>
          {({ width, height }) => (
            <div style={{ width, height }}>
              <Table>
                <ProfileTableHeader
                  sortKey={sortKey}
                  setSortKey={setSortKey}
                  sortReversed={sortReversed}
                  setSortReversed={setSortReversed}
                />
                <tbody>
                  {columnList.map((column) => (
                    <ProfileRow
                      key={column.label}
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
    </RootFlex>
  );
};

const Card = styled.div`
  padding: 16px;
  margin: 10px 10px 20px 0;
  border: 1px solid ${Colors['greyscale-grey3'].hex()};
  border-radius: 8px;
  min-width: 277px;
  header {
    display: block;
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .count {
    color: ${Colors['greyscale-grey9'].hex()};
    font-weight: 900;
    font-size: 24px;
    line-height: 32px;
  }
  .coverage {
    padding: 8px 12px;
    color: #22633c;
    background: rgba(57, 162, 99, 0.12);
    border-radius: 6px;
  }
  .coverage.running {
    color: black;
    background: rgb(247 97 97 / 12%);
  }
`;

const RootFlex = styled(Flex)`
  padding: 36px 24px 24px;
  height: 100%;
`;

const CardsFlex = styled(Flex)`
  padding: 24px 0;
`;
const Table = styled.table`
  margin: 0;
  width: 100%;
  border-radius: 8px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  tr:not(:last-child) > td {
    border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  td:not(:last-child) {
    border-right: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
`;
