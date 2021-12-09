import React, { useMemo, useState } from 'react';

import { Flex, Loader, Title, Colors, Icon } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { sortBy } from 'lodash';
import { AutoResizer } from 'react-base-table';
import styled from 'styled-components';

import { useActiveTableContext } from 'contexts';
import { useFilteredColumns } from 'hooks/table-filters';
import {
  useQuickProfile,
  useFullProfile,
  useColumnType,
  useProfileResultType,
  ColumnProfile,
} from 'hooks/profiling-service';

import ProfileRow, { TableData } from './ProfileRow';
import {
  ProfileStatusMessage,
  ProfileCoverageLabel,
} from 'components/ProfileStatus';

import { FilterBar } from 'containers/Spreadsheet/FilterBar';

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

const StyledCount = styled.div<{ $isRunning?: boolean }>`
  color: ${({ $isRunning }) =>
    $isRunning ? Colors['text-hint'].hex() : Colors['greyscale-grey9'].hex()};
  font-weight: 900;
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 0;
`;

type SortableColumn = keyof ColumnProfile;
export const Profiling = (): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const { isFetched: areTypesFetched } = useColumnType(database, table);

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

  const profileResultType = useProfileResultType(database, table);

  const [sortKey, _setSortKey] = useState<SortableColumn>('label');
  const [sortReversed, _setSortReversed] = useState(false);
  const setSortKey = (key: SortableColumn) => {
    const reverse = sortKey === key;
    _setSortKey(key);
    if (reverse) {
      _setSortReversed(!sortReversed);
    }
  };

  const filteredColumns = useFilteredColumns(data.columns);

  const columnList = useMemo(() => {
    const columns = sortBy(filteredColumns, sortKey);
    if (sortReversed) {
      return columns.reverse();
    }
    return columns;
  }, [filteredColumns, sortKey, sortReversed]);

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
      <ProfileStatusMessage resultType={profileResultType} />
      <Title level={4}>Table summary</Title>
      <Flex direction="row">
        <Card className="z-2">
          <header>Rows profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <StyledCount $isRunning={!fullProfile.isFetched}>
              {data.rowCount}
            </StyledCount>
            <ProfileCoverageLabel
              coverageType="rows"
              resultType={profileResultType}
            />
          </Flex>
        </Card>
        <Card className="z-2">
          <header>Columns profiled</header>
          <Flex direction="row" justifyContent="space-between">
            <StyledCount $isRunning={!fullProfile.isFetched}>
              {Object.values(data.columns).length}
            </StyledCount>
            <ProfileCoverageLabel
              coverageType="columns"
              resultType={profileResultType}
            />
          </Flex>
        </Card>
      </Flex>
      <Flex style={{ width: '100%', paddingBottom: '8px' }}>
        <FilterBar areTypesFetched={areTypesFetched} />
      </Flex>
      <Flex style={{ width: '100%', height: '100%' }}>
        <AutoResizer>
          {({ width, height }) => (
            <div style={{ width, height }}>
              <Table>
                <TableHeader>
                  <tr>
                    <TableData $width={44}>
                      <Flex
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
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
