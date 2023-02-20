import {
  Body,
  Button,
  Collapse as CogsCollapse,
  Select,
} from '@cognite/cogs.js';

import { useState } from 'react';
import { Asset, DataSet, FileInfo, IdEither } from '@cognite/sdk';

import { useList } from '@cognite/sdk-react-query-hooks';
import { useSystemQuery } from '../../service/hooks/query/useSystemQuery';

import styled from 'styled-components';
import { useValidate } from '../../hooks/useValidate';
import { SearchEmpty } from '@data-exploration-components/graphics';

const ACCESSOR_FIELDS = {
  assets: [
    { value: 'name', label: 'Name' },
    { value: 'externalId', label: 'ExternalId' },
  ],
  files: [
    { value: 'name', label: 'Name' },
    { value: 'externalId', label: 'ExternalId' },
  ],
};

export const ConventionValidation = () => {
  const { data: system } = useSystemQuery();

  const [result, setResult] = useState<
    { hits: string[]; misses: string[] } | undefined
  >(undefined);

  const [selectedDataSets, setSelectedDataSets] = useState<
    { value: string; label: string }[]
  >([]);

  const [fieldId, setFieldId] = useState<{ value: string; label: string }>();
  const { data: datasets } = useList<DataSet>('datasets', { limit: 1000 });

  const field = fieldId?.value;
  const dataSetIds = selectedDataSets.map((item) => ({ id: item.value }));

  const { run, isLoading } = useValidate();

  if (!system) {
    return <p>No resource found</p>;
  }

  return (
    <Container>
      <RightSide>
        <Select
          label="Select field to validate *"
          placeholder="Select field to validate"
          options={ACCESSOR_FIELDS?.[system!.resource] || []}
          value={fieldId}
          width={250}
          onChange={(e: any) => {
            setFieldId(e);
          }}
        />
        <Select
          label="Select dataset"
          placeholder="Select dataset"
          options={
            datasets
              ? datasets.map((item: DataSet) => ({
                  value: item.id.toString(),
                  label: item.name?.toString() || '',
                }))
              : []
          }
          isMulti={true}
          value={selectedDataSets}
          width={250}
          onChange={(e: any) => {
            setSelectedDataSets(e);
          }}
        />
        <Button
          type="primary"
          disabled={isLoading || !field}
          onClick={async () => {
            const results = await run?.(
              system.resource,
              field!,
              dataSetIds as unknown as IdEither[]
            );
            setResult(results);
          }}
        >
          Run
        </Button>
      </RightSide>

      {result ? (
        <Collapse>
          <Collapse.Panel header={<>Matches: {result.hits.length}</>}>
            <ul>
              {result.hits.map((item, index) => (
                <li key={item + index}>{item}</li>
              ))}
            </ul>
          </Collapse.Panel>
          <Collapse.Panel header={<>No matches: {result.misses.length}</>}>
            <ul>
              {result.misses.map((item, index) => (
                <li key={item + index}>{item}</li>
              ))}
            </ul>
          </Collapse.Panel>
        </Collapse>
      ) : (
        <EmptyResultContainer>
          <SearchEmpty />
          <Body>Select the appropriate files and press the run button.</Body>
        </EmptyResultContainer>
      )}
    </Container>
  );
};

const Collapse = styled(CogsCollapse)`
  margin-top: 32px;
  .rc-collapse-header {
    background-color: var(--cogs-surface--medium);
    position: sticky;
    top: 0;
    border: 8px;
  }
`;

const EmptyResultContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 36px;
  margin-bottom: 16px;
  flex-direction: column;
  align-items: center;
`;

export const Container = styled.div``;

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const RightSide = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
`;

export const Scrollable = styled.div`
  overflow: auto;
  height: 100%;
  display: flex;
`;
