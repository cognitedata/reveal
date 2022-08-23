import {
  ASTVisitor,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLError,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeExtensionNode,
  TypeDefinitionNode,
  UnionTypeDefinitionNode,
  ValidationContext,
} from 'graphql';
import { fieldDefinitionApi } from 'graphql-extra';

export function NotSupportedFeaturesRule(
  context: ValidationContext
): ASTVisitor {
  const schema = context.getSchema();

  return {
    FieldDefinition: checkFieldDef,
    EnumTypeDefinition: checkForEnums,
    InterfaceTypeDefinition: checkForInterfaces,
    ObjectTypeExtension: checkForTypeExtension,
    UnionTypeDefinition: checkForUnionTypeDefs,
    InputObjectTypeDefinition: checkForInputTypeDefs,
  };

  function checkForUnionTypeDefs(node: UnionTypeDefinitionNode) {
    context.reportError(new GraphQLError(`Unions are not supported.`, node));
  }

  function checkForInputTypeDefs(node: InputObjectTypeDefinitionNode) {
    context.reportError(
      new GraphQLError(`Input type defenitions are not supported.`, node)
    );
  }

  function checkForTypeExtension(node: ObjectTypeExtensionNode) {
    context.reportError(
      new GraphQLError(`Type extensions are not supported.`, node)
    );
  }

  function checkForInterfaces(node: InterfaceTypeDefinitionNode) {
    context.reportError(
      new GraphQLError(`Interfaces are not supported.`, node)
    );
  }

  function checkForEnums(node: EnumTypeDefinitionNode) {
    context.reportError(new GraphQLError(`Enums are not supported.`, node));
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
    let typeNode = undefined;

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
          typeNode = type as any as TypeDefinitionNode;
          break;
        }
      }
    }

    return typeNode;
  }
}
