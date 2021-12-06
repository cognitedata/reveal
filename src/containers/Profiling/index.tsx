import React, { useMemo, useState } from 'react';
import { Alert } from 'antd';
import { sortBy } from 'lodash';
import styled from 'styled-components';
import { Flex, Loader, Title, Colors, Icon } from '@cognite/cogs.js';
import {
  ColumnProfile,
  useQuickProfile,
  useFullProfile,
} from 'hooks/profiling-service';
import { AutoResizer } from 'react-base-table';
import { useActiveTableContext } from 'contexts';
import ProfileRow, { TableData } from './ProfileRow';

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
  padding: 10px;
  height: 100%;
`;

const TableHeader = styled.thead`
  background-color: ${Colors['greyscale-grey1'].hex()};
  color: ${Colors['greyscale-grey7'].hex()};
  td .cogs-icon {
    cursor: pointer;
  }
`;

const Table = styled.table`
  width: 100%;
  .numeric {
    text-align: right;
  }
`;

const StyledExpandTableHeaderIcon = styled(Icon)`
  cursor: pointer;
  margin: 0 10px;
`;

type SortableColumn = keyof ColumnProfile;
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

  const [sortKey, _setSortKey] = useState<SortableColumn>('label');
  const [sortReversed, _setSortReversed] = useState(false);
  const setSortKey = (key: SortableColumn) => {
    const reverse = sortKey === key;
    _setSortKey(key);
    if (reverse) {
      _setSortReversed(!sortReversed);
    }
  };

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
      <Flex direction="row">
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
      </Flex>
      <Flex style={{ width: '100%', height: '100%' }}>
        <AutoResizer>
          {({ width, height }) => (
            <div style={{ width, height }}>
              <Table>
                <TableHeader>
                  <tr>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Type
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('type')}
                        />
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Column
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('label')}
                        />
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Empty
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('nullCount')}
                        />
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Distinct
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('distinctCount')}
                        />
                      </Flex>
                    </TableData>
                    <TableData $width={150}>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Frequency
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Min
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('min')}
                        />
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Max
                        <Icon
                          type="ReorderDefault"
                          onClick={() => setSortKey('max')}
                        />
                      </Flex>
                    </TableData>
                    <TableData>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        Mean
                      </Flex>
                    </TableData>
                    <TableData $width={68}>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <StyledExpandTableHeaderIcon type="ChevronDown" />
                      </Flex>
                    </TableData>
                  </tr>
                </TableHeader>
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
