import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';

export function getPropKindAndType(
  schemaType: string,
  property: string,
  parsedSchema: IntrospectionQuery
) {
  const propertySchemaDef = (
    parsedSchema['__schema'].types.find(
      (type) => type.name === schemaType
    ) as IntrospectionObjectType
  ).fields.find((field) => field.name === property);

  const mutedKind =
    propertySchemaDef.type.kind === 'NON_NULL'
      ? propertySchemaDef.type.ofType
      : propertySchemaDef.type;
  const mutedType = propertySchemaDef.type as any;
  const fieldKind = mutedKind.kind;
  const fieldSchemaType = mutedType.ofType
    ? getType(mutedType.ofType)
    : (propertySchemaDef.type as any).name;

  return { kind: fieldKind, type: fieldSchemaType };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getType(input: any): string | any {
  if (input.ofType && Object.keys(input.ofType)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return getType(input.ofType);
  }

  return input.name;
}
