import { DataModelPropertyNameValidator } from '@platypus/platypus-core';
import {
  ASTVisitor,
  FieldDefinitionNode,
  GraphQLError,
  ValidationContext,
} from 'graphql';

export function FieldNodeValidator(context: ValidationContext): ASTVisitor {
  return {
    FieldDefinition: validateFieldName,
  };

  function validateFieldName(node: FieldDefinitionNode) {
    const validator = new DataModelPropertyNameValidator();
    const result = validator.validate('field', node.name.value);

    if (!result.valid) {
      context.reportError(
        new GraphQLError(result.errors.field, { nodes: [node] })
      );
    }
  }
}
