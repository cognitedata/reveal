import React, { useMemo } from 'react';
import { Alert } from 'antd';
import styled from 'styled-components';
import { Flex, Loader, Title, Colors } from '@cognite/cogs.js';
import { useRawProfile, useTotalRowCount } from 'hooks/sdk-queries';
import { AutoResizer } from 'react-base-table';
import { useActiveTableContext } from 'contexts';
import NumberProfileRow from './NumberProfileRow';
import StringProfileRow from './StringProfileRow';
import BooleanProfileRow from './BooleanProfileRow';
import ObjectProfileRow from './ObjectProfileRow';
import VectorProfileRow from './VectorProfileRow';
import { TableData } from './ProfileRow';

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
`;

const RootFlex = styled(Flex)`
  padding: 10px;
  height: 100%;
`;

const TableHeader = styled.thead`
  background-color: ${Colors['greyscale-grey1'].hex()};
  color: ${Colors['greyscale-grey7'].hex()};
`;

const Table = styled.table`
  width: 100%;
  .numeric {
    text-align: right;
  }
`;

export const Profiling = (): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const { data: rowCount } = useTotalRowCount({ database, table });

  const fullProfile = useRawProfile({
    database,
    table,
  });

  const limitProfile = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const {
    data = { columns: {} },
    isLoading,
    isError,
    error,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const columnList = useMemo(
    () => Object.entries(data.columns).sort((a, b) => a[0].localeCompare(b[0])),
    [data.columns]
  );

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
            <div className="count">{rowCount}</div>
            <div className="coverage">100%</div>
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
                    <TableData>Type</TableData>
                    <TableData>Column</TableData>
                    <TableData>Empty</TableData>
                    <TableData>Distinct</TableData>
                    <TableData>Frequency</TableData>
                    <TableData>Min</TableData>
                    <TableData>Max</TableData>
                    <TableData>Mean</TableData>
                  </tr>
                </TableHeader>
                <tbody>
                  {columnList.map(([label, column]) => [
                    column.number && (
                      <NumberProfileRow
                        allCount={column.count}
                        key={`${label}_number`}
                        label={label}
                        nullCount={column.nullCount}
                        profile={column.number}
                      />
                    ),
                    column.string && (
                      <StringProfileRow
                        allCount={column.count}
                        key={`${label}_string`}
                        label={label}
                        nullCount={column.nullCount}
                        profile={column.string}
                      />
                    ),
                    column.boolean && (
                      <BooleanProfileRow
                        allCount={column.count}
                        key={`${label}_boolean`}
                        label={label}
                        nullCount={column.nullCount}
                        profile={column.boolean}
                      />
                    ),
                    column.vector && (
                      <VectorProfileRow
                        allCount={column.count}
                        key={`${label}_vector`}
                        label={label}
                        nullCount={column.nullCount}
                        profile={column.vector}
                      />
                    ),
                    column.object && (
                      <ObjectProfileRow
                        allCount={column.count}
                        key={`${label}_object`}
                        label={label}
                        nullCount={column.nullCount}
                        profile={column.object}
                      />
                    ),
                  ])}
                </tbody>
              </Table>
            </div>
          )}
        </AutoResizer>
      </Flex>
    </RootFlex>
  );
};
