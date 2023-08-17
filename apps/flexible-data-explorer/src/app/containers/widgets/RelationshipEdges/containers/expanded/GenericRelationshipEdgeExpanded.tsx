import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

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

  const [filterState, setFilterState] = useState<ValueByField | undefined>(
    undefined
  );

  const { data, status, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInstanceRelationshipQuery(type, filterState);

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
        <RelationshipFilter
          dataType={type.type}
          value={filterState}
          onChange={setFilterState}
        />
      </Widget.Header>

      <Widget.Body state={status} noPadding>
        <Table
          id="relationship-table"
          data={data?.items || EMPTY_ARRAY}
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
