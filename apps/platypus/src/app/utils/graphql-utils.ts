import {
  DataModelTypeDefsFieldType,
  DataModelTypeDefsType,
  DirectiveProps,
} from '@platypus/platypus-core';

export type SchemaDefinitionNode = DataModelTypeDefsType;

export const doesFieldHaveDirective = (
  directives: DirectiveProps[],
  directiveName: string
) => directives.some((directive) => directive.name === directiveName);

export const renderFieldType = (type: DataModelTypeDefsFieldType): string => {
  let name = type.name;
  if (type.list) {
    name = `[${name}]`;
  }
  if (type.nonNull) {
    name = `${name}!`;
  }
  return name;
};

export const getLinkedNodes = (
  schemaName: string,
  schemas: DataModelTypeDefsType[]
) => {
  const schemaNode = schemas.find((schema) => schema.name === schemaName);
  const linkedNodes: { type: DataModelTypeDefsType; field?: string }[] = [];
  switch (schemaNode?.kind) {
    case 'type': {
      const fieldsTypes = schemaNode?.fields?.map((el) => ({
        type: el.type.name,
        name: el.name,
      }));
      if (fieldsTypes) {
        fieldsTypes.forEach(({ name, type }) => {
          const typeDef = schemas.find(
            (schemaType) => schemaType.name === type
          );
          if (typeDef) {
            linkedNodes.push({ type: typeDef, field: name });
          }
        });
      }
      break;
    }
    case 'interface': {
      const linkedInterfaces = schemas.filter((schemaType) =>
        schemaType.interfaces?.some((el) => el === schemaNode.name)
      );
      linkedInterfaces.forEach((type) => {
        linkedNodes.push({ type });
      });
      break;
    }
  }
  return linkedNodes;
};
