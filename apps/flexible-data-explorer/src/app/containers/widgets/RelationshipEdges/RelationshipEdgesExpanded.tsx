import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { Table } from '../../../components/table/Table';
import { Widget } from '../../../components/widget/Widget';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';
import { useInstanceRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceRelationshipQuery';
import { ValueByField } from '../../search/Filter';

import { RelationshipFilter } from './Filters';
import { RelationshipEdgesProps } from './RelationshipEdgesWidget';

export const RelationshipEdgesExpanded: React.FC<RelationshipEdgesProps> = ({
  type,
}) => {
  const { instanceSpace } = useParams();
  const { data: types } = useTypesDataModelQuery();

  const navigate = useNavigation();

  const [filterState, setFilterState] = useState<ValueByField | undefined>(
    undefined
  );

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInstanceRelationshipQuery(type, filterState);

  const tableColumns = useMemo(() => {
    const fields = types?.find((item) => item.name === type.type)?.fields || [];

    return fields.map((field) => ({
      header: field.name,
      accessorKey: field.id,
    }));
  }, [types, type.type]);

  return (
    <Widget expanded>
      <Widget.Header>
        <RelationshipFilter
          dataType={type.type}
          value={filterState}
          onChange={setFilterState}
        />
      </Widget.Header>

      <Widget.Body noPadding>
        <Table
          id="relationship-table"
          data={data}
          columns={tableColumns}
          onRowClick={(row) => {
            navigate.toInstancePage(type.type, instanceSpace, row.externalId);
          }}
        />

        <ButtonWrapper>
          <Button
            loading={isFetchingNextPage}
            hidden={!hasNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
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
