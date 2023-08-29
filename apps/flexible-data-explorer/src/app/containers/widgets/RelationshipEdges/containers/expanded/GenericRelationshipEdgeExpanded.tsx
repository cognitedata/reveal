import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { matchSorter } from 'match-sorter';

import { Button, InputExp } from '@cognite/cogs.js';

import { Table } from '../../../../../components/table/Table';
import { Widget } from '../../../../../components/widget/Widget';
import { EMPTY_ARRAY } from '../../../../../constants/object';
import { useNavigation } from '../../../../../hooks/useNavigation';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useFDM } from '../../../../../providers/FDMProvider';
import { useInstanceRelationshipQuery } from '../../../../../services/instances/generic/queries/useInstanceRelationshipQuery';
import { ValueByField } from '../../../../Filter';
import { RelationshipFilter } from '../../Filters';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const GenericRelationshipEdgesExpanded: React.FC<
  RelationshipEdgesProps
> = ({ type }) => {
  const { t } = useTranslation();
  const client = useFDM();
  const { instanceSpace, dataModel, version, space } = useParams();

  const navigate = useNavigation();

  const [inputValue, setInputValue] = useState<string>('');
  const [filterState, setFilterState] = useState<ValueByField | undefined>(
    undefined
  );

  const { data, status, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInstanceRelationshipQuery(type, filterState);

  const transformedData = useMemo(() => {
    if (!data) {
      return EMPTY_ARRAY;
    }

    const filteredData = matchSorter(data.items, inputValue, {
      // TODO: get the keys from the data model
      keys: ['name', 'description', 'externalId'],
    });

    return filteredData;
  }, [data, inputValue]);

  const tableColumns = useMemo(() => {
    const fields = client.allDataTypes?.find(
      (item) => item.name === type.type
    )?.fields;

    const transformedFields = (fields || []).map((field) => ({
      header: field.name,
      accessorKey: field.id,
    }));

    return [
      { header: 'External id', accessorKey: 'externalId' },
      ...transformedFields,
    ];
  }, [client.allDataTypes, type.type]);

  return (
    <Widget expanded>
      <Widget.Header>
        <InputExp
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('PROPERTIES_WIDGET_SEARCH_INPUT_PLACEHOLDER')}
          icon="Search"
          clearable
        />
        <RelationshipFilter
          dataType={type.type}
          value={filterState}
          onChange={setFilterState}
        />
      </Widget.Header>

      <Widget.Body
        state={transformedData.length === 0 ? 'empty' : status}
        noPadding
      >
        <Table
          id="relationship-table"
          data={transformedData}
          columns={tableColumns}
          onRowClick={(row) => {
            navigate.toInstancePage(type.type, instanceSpace, row.externalId, {
              dataModel,
              space,
              version,
            });
          }}
        />

        <ButtonWrapper>
          <Button
            loading={isFetchingNextPage}
            hidden={!hasNextPage}
            onClick={() => fetchNextPage()}
          >
            {t('GENERAL_LOAD_MORE')}
          </Button>
        </ButtonWrapper>
      </Widget.Body>
    </Widget>
  );
};

const ButtonWrapper = styled.div`
  padding: 8px;
  display: flex;
  justify-content: center;
`;
