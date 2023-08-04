import { DataModelTypeNameValidator } from '@platypus/platypus-core';
import {
  ASTVisitor,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLError,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  TypeDefinitionNode,
  UnionTypeDefinitionNode,
  ValidationContext,
} from 'graphql';
import { fieldDefinitionApi } from 'graphql-extra';

import { getWhiteListedEnumsAndInputs } from '../utils';

export function NotSupportedFeaturesRule(
  context: ValidationContext
): ASTVisitor {
  const schema = context.getSchema();

  return {
    InterfaceTypeDefinition: checkInterfaceTypeDef,
    ObjectTypeDefinition: checkObjectTypeDef,
    FieldDefinition: checkFieldDef,
    EnumTypeDefinition: checkForEnums,
    ObjectTypeExtension: checkForTypeExtension,
    UnionTypeDefinition: checkForUnionTypeDefs,
    InputObjectTypeDefinition: checkForInputTypeDefs,
  };

  function checkForUnionTypeDefs(node: UnionTypeDefinitionNode) {
    context.reportError(new GraphQLError(`Unions are not supported.`, node));
  }

  function checkForInputTypeDefs(node: InputObjectTypeDefinitionNode) {
    if (!getWhiteListedEnumsAndInputs().includes(node.name.value)) {
      context.reportError(
        new GraphQLError(`Input type definitions are not supported.`, node)
      );
    }
  }

  function checkForTypeExtension(node: ObjectTypeExtensionNode) {
    context.reportError(
      new GraphQLError(`Type extensions are not supported.`, node)
    );
  }

  function checkForEnums(node: EnumTypeDefinitionNode) {
    if (!getWhiteListedEnumsAndInputs().includes(node.name.value)) {
      context.reportError(new GraphQLError(`Enums are not supported.`, node));
    }
  }

  function checkObjectTypeDef(node: ObjectTypeDefinitionNode) {
    const typeNameValidator = new DataModelTypeNameValidator();
    const validationResult = typeNameValidator.validate(
      `Type name "${node.name.value}"`,
      node.name.value
    );

    if (!validationResult.valid) {
      context.reportError(
        new GraphQLError(
          validationResult.errors[`Type name "${node.name.value}"`] ||
            'Invalid type name',
          node.name
        )
      );
    }
  }

  function checkInterfaceTypeDef(node: InterfaceTypeDefinitionNode) {
    const typeNameValidator = new DataModelTypeNameValidator();
    const validationResult = typeNameValidator.validate(
      `Interface name "${node.name.value}"`,
      node.name.value
    );

    if (!validationResult.valid) {
      context.reportError(
        new GraphQLError(
          validationResult.errors[`Interface name "${node.name.value}"`] ||
            'Invalid interface name',
          node.name
        )
      );
    }
  }

  function checkFieldDef(node: FieldDefinitionNode) {
    const fieldDef = fieldDefinitionApi(node);
    const existingType = schema?.getType(fieldDef.getTypename());

    if (existingType?.astNode?.kind === 'ObjectTypeDefinition') {
      const parentNode = getParentNode(fieldDef.node);

      const fieldName = parentNode
        ? `${parentNode.name}.${fieldDef.getName()}`
        : fieldDef.getName();

      if (fieldDef.isNonNullType()) {
        context.reportError(
          new GraphQLError(`Field "${fieldName}" cannot be required.`, node)
        );
      }

      // Skip for now, We will enable it bit later
      // if (fieldDef.isListType()) {
      //   context.reportError(
      //     new GraphQLError(
      //       `Field "${fieldName}" can not be of type List. Currently, we don't support Lists of custom types.`,
      //       node
      //     )
      //   );
      // }

      if (fieldDef.getArguments().length) {
        context.reportError(
          new GraphQLError(
            `Field "${fieldName}" can not have Input arguments.`,
            node
          )
        );
      }
    }

    if (fieldDef.isListType()) {
      const isListTypeRequired = fieldDef.getType().node.kind === 'NonNullType';
      const isListElementTypeRequired =
        fieldDef.getNamedType()?.name?.loc?.endToken?.next?.kind === '!';

      if (
        (isListTypeRequired && !isListElementTypeRequired) ||
        (!isListTypeRequired && isListElementTypeRequired)
      ) {
        context.reportError(
          new GraphQLError(
            `Field "${fieldDef.getName()}" should be a required type if the list element type is required. For example, the valid cases are "[${fieldDef.getTypename()}]" and "[${fieldDef.getTypename()}!]!"`,
            node
          )
        );
      }
    }

    return false;
  }

  function getParentNode(
    fieldDef: FieldDefinitionNode
  ): TypeDefinitionNode | undefined {
    const typeMap = schema.getTypeMap();

    const fieldName = fieldDef.name.value;
    let typeNode: TypeDefinitionNode | undefined = undefined;

    for (const key in typeMap) {
      const type = schema.getType(key);

      if (type?.astNode?.kind === 'ObjectTypeDefinition') {
        const fieldIdx = type.astNode?.fields?.findIndex(
          (field) => field.name.value === fieldName
        );

        if (
          fieldIdx !== -1 &&
          type.astNode?.fields &&
          type.astNode?.fields[fieldIdx as number]?.loc?.startToken.line ===
            fieldDef.loc?.startToken.line
        ) {
          typeNode = type as unknown as TypeDefinitionNode;
          break;
        }
      }
    }

    return typeNode;
  }
}
