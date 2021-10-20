import { FieldDefinitionNode, ObjectTypeDefinitionNode, parse } from 'graphql';
import { useMemo } from 'react';
import { Table } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  doesFieldHaveDirective,
  getFieldType,
} from '../../utils/graphql-utils';
import { Error } from '../Error/Error';
import { PropertyAttributesDisplay } from '../PropertyAttributesDisplay/PropertyAttributesDisplay';

export type Field = {
  field: FieldDefinitionNode;
  id: number;
};

export const SchemaTypePreview = ({
  schemaName,
  graphQLSchemaString,
}: {
  schemaName: string;
  graphQLSchemaString: string;
}) => {
  const schemaTypes = useMemo(
    () =>
      parse(graphQLSchemaString as string).definitions.filter(
        (definition) =>
          definition.kind === 'ObjectTypeDefinition' ||
          definition.kind === 'InterfaceTypeDefinition'
      ),
    [graphQLSchemaString]
  ) as ObjectTypeDefinitionNode[];

  const item = schemaTypes.find(
    (el) => 'name' in el && el.name?.value === schemaName
  );

  if (!item) {
    return <Error message="Unable to find schema type!" />;
  }

  const fields = item.fields?.map(
    (field: FieldDefinitionNode, index: number) => ({
      field,
      id: index,
    })
  ) as Field[];

  const columns = [
    {
      accessor: (field: Field) =>
        doesFieldHaveDirective(field.field, 'id') ? (
          <StyledMainID>{field.field.name.value}</StyledMainID>
        ) : (
          field.field.name.value
        ),
      id: 'name',
    },
    {
      accessor: ({ field: { type } }: Field) => getFieldType(type),
      id: 'type',
    },
    {
      accessor: (field: Field) => (
        <PropertyAttributesDisplay field={field.field} />
      ),
      id: 'directives',
    },
    {
      accessor: ({ field: { description } }: Field) =>
        description?.value ? (
          description?.value
        ) : (
          <StyledNoDescription>No description</StyledNoDescription>
        ),
      id: 'description',
    },
  ];
  return (
    <Wrapper>
      <Table<Field>
        dataSource={fields}
        columns={columns}
        pagination={false}
        showHeader={false}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .cogs-table {
    tr:nth-child(2n) {
      background: white;
    }
    tr:hover {
      background: var(--cogs-greyscale-grey1);
    }
  }
`;

const StyledMainID = styled.span`
  display: inline-block;
  padding: 0 0.1rem;
  color: var(--cogs-white);
  border-radius: 4px;
  background-color: var(--cogs-greyscale-grey9);
`;

const StyledNoDescription = styled.span`
  color: var(--cogs-greyscale-grey6);
  font-style: italic;
`;
