import { DirectiveProps } from '@platypus/platypus-core';
import {
  DefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from 'graphql';

export type SchemaDefinitionNode =
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode;

export const isFieldRequired = (type: TypeNode): boolean => {
  switch (type?.kind) {
    case 'NamedType':
      return false;
    case 'NonNullType':
      return true;
    case 'ListType':
      return isFieldRequired(type.type);
  }
  return false;
};

export const doesFieldHaveDirective = (
  directives: DirectiveProps[],
  directiveName: string
) => directives.some((directive) => directive.name === directiveName);

export const getFieldType = (type: TypeNode): string => {
  switch (type?.kind) {
    case 'NamedType':
      return type.name.value;
    case 'ListType':
    case 'NonNullType':
      return getFieldType(type.type);
    default:
      return '';
  }
};

export const renderFieldType = (type: TypeNode): string => {
  switch (type?.kind) {
    case 'NamedType':
      return type.name.value;
    case 'ListType':
      return `[${renderFieldType(type.type)}]`;
    case 'NonNullType':
      return renderFieldType(type.type).concat('!');
    default:
      return '';
  }
};

export const getLinkedNodes = (
  schemaName: string,
  schemas: SchemaDefinitionNode[]
) => {
  const schemaNode = schemas.find((schema) => schema.name.value === schemaName);
  const linkedNodes: { type: SchemaDefinitionNode; field?: string }[] = [];
  switch (schemaNode?.kind) {
    case 'ObjectTypeDefinition': {
      const fieldsTypes = schemaNode?.fields?.map((el) => ({
        type: getFieldType(el.type),
        name: el.name.value,
      }));
      if (fieldsTypes) {
        fieldsTypes.forEach(({ name, type }) => {
          const typeDef = schemas.find(
            (schemaType) => schemaType.name.value === type
          );
          if (typeDef) {
            linkedNodes.push({ type: typeDef, field: name });
          }
        });
      }
      break;
    }
    case 'InterfaceTypeDefinition': {
      const linkedInterfaces = schemas.filter(
        (schemaType) =>
          schemaType.kind === 'ObjectTypeDefinition' &&
          schemaType.interfaces?.some(
            (el) => el.name.value === schemaNode.name.value
          )
      );
      linkedInterfaces.forEach((type) => {
        linkedNodes.push({ type });
      });
      break;
    }
    case 'UnionTypeDefinition': {
      schemaNode.types?.forEach((type) => {
        const schemaType = schemas.find(
          (schema) => schema.name.value === type.name.value
        );
        if (schemaType) {
          linkedNodes.push({ type: schemaType });
        }
      });
      break;
    }
  }
  return linkedNodes;
};
export const getObjectTypes = (schemaTypes: readonly DefinitionNode[]) =>
  schemaTypes.filter(
    (schemaType) => schemaType.kind === 'ObjectTypeDefinition'
  ) as ObjectTypeDefinitionNode[];

export const getUnionTypes = (schemaTypes: readonly DefinitionNode[]) =>
  schemaTypes.filter(
    (schemaType) => schemaType.kind === 'UnionTypeDefinition'
  ) as UnionTypeDefinitionNode[];

export const getInterfaceTypes = (schemaTypes: readonly DefinitionNode[]) =>
  schemaTypes.filter(
    (schemaType) => schemaType.kind === 'InterfaceTypeDefinition'
  ) as InterfaceTypeDefinitionNode[];
