import { Dispatch, useMemo } from 'react';

import styled from 'styled-components';

import { ContextualizationScoreChip } from '@fusion/contextualization';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { useTables } from '../hooks/sdk-queries';
import { EstimateArray, JobStatus, RawTableProps } from '../types';

import { collectPages } from './DatabaseColumn';
import {
  CenteredColumnContent,
  Column,
  Item,
  Label,
} from './TransformationComponents';
type TableColumnProps = {
  database: string;
  setSelectedTable: Dispatch<React.SetStateAction<string | null>>;
  selectedTable: string | null;
  estimateArray: EstimateArray[];
};

export const TableColumn = ({
  database,
  setSelectedTable,
  selectedTable,
  estimateArray,
}: TableColumnProps): JSX.Element => {
  const { data, isSuccess, isInitialLoading } = useTables({ database });
  const tables = useMemo(
    () => collectPages(data!).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const getTableEstimateStatus = (tableName: string) =>
    estimateArray.find((t) => t.tableName === tableName)?.status;

  const getTableEstimate = (tableName: string) =>
    estimateArray.find((t) => t.tableName === tableName)?.jobResponse
      ?.contextualizationScorePercent;

  return (
    <Column>
      <Label>Table</Label>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && tables?.length === 0 && (
        <CenteredColumnContent>No tables found</CenteredColumnContent>
      )}
      {tables?.map((rawTable: RawTableProps) => (
        <Item
          key={rawTable.name}
          $active={rawTable.name === selectedTable}
          onClick={() => setSelectedTable(rawTable.name)}
        >
          <Flex alignItems="center" gap={8}>
            <Icon type="DataTable" />
            {rawTable.name}
          </Flex>
          <ButtonContainer>
            {getTableEstimateStatus(rawTable.name) === undefined && (
              <Button type="primary" style={{ maxHeight: '20px' }}>
                Estimate
              </Button>
            )}
            {getTableEstimateStatus(rawTable.name) === JobStatus.Running && (
              <Spinner
                style={{
                  background: 'rgba(0,0,0, 0.0 )',
                  marginRight: '10px',
                  height: '20px',
                  maxHeight: '20px',
                  width: '20px',
                  maxWidth: '20px',
                }}
              />
            )}
            {getTableEstimateStatus(rawTable.name) === JobStatus.Completed && (
              <ContextualizationScoreChip
                value={String(getTableEstimate(rawTable.name))}
                headerName=""
              />
            )}
          </ButtonContainer>
        </Item>
      ))}
    </Column>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
