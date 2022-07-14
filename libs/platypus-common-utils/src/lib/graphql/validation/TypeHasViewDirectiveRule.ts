import { ASTVisitor, GraphQLError, TypeDefinitionNode } from 'graphql';
import { SDLValidationContext } from 'graphql/validation/ValidationContext';

/**
 * Possible type extension
 *
 * A type extension is only valid if the type is defined and has the same kind.
 */
export function TypeHasViewDirectiveRule(
  context: SDLValidationContext
): ASTVisitor {
  const schema = context.getSchema();

  return {
    ScalarTypeDefinition: checkForViewDirective,
    ObjectTypeDefinition: checkForViewDirective,
    InterfaceTypeDefinition: checkForViewDirective,
    UnionTypeDefinition: checkForViewDirective,
    EnumTypeDefinition: checkForViewDirective,
    InputObjectTypeDefinition: checkForViewDirective,
  };

  function checkForViewDirective(node: TypeDefinitionNode) {
    const typeName = node.name.value;
    const existingType = schema?.getType(typeName);

    if (
      !existingType?.astNode?.directives?.length &&
      existingType?.astNode?.kind === 'ObjectTypeDefinition' &&
      typeName !== 'Query'
    ) {
      const error = new GraphQLError(
        `Type "${typeName}" must have @view directive`,
        [existingType.astNode]
      );
      context.reportError(error);
    }

    return false;
  }
}
