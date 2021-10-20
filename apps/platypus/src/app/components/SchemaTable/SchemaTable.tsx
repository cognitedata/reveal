import { parse } from 'graphql';
import { useMemo } from 'react';
import { Error } from '../Error/Error';
import { SchemaObjectTable } from './SchemaObjectTable';

export const SchemaTable = ({
  schemaName,
  graphQLSchemaString,
}: {
  schemaName: string;
  graphQLSchemaString: string;
}) => {
  const schemaTypes = useMemo(
    () => parse(graphQLSchemaString as string).definitions,
    [graphQLSchemaString]
  );

  const item = schemaTypes.find(
    (el) => 'name' in el && el.name?.value === schemaName
  );
  if (!item) {
    return <Error message="Unable to find schema!" />;
  }

  switch (item.kind) {
    case 'ObjectTypeDefinition':
      return <SchemaObjectTable node={item} />;
  }
  return <p>TODO</p>;
};
