import {
  ArgumentNode,
  ASTVisitor,
  DirectiveNode,
  FieldDefinitionNode,
  GraphQLError,
  ValidationContext,
} from 'graphql';

export function MappingDirectiveValidator(
  context: ValidationContext
): ASTVisitor {
  return {
    FieldDefinition: ValidateFieldDefinition,
  };

  function ValidateFieldDefinition(node: FieldDefinitionNode) {
    if (node.directives) {
      node.directives.forEach((directive) => {
        if (directive.name.value === 'mapping') {
          validateMappingDirective(directive);
        }
      });
    }
  }

  function validateMappingDirective(directive: DirectiveNode) {
    if (directive.arguments) {
      directive.arguments.forEach((argument) => {
        switch (argument.name.value) {
          case 'space':
            if (!argumentIsString(argument)) {
              context.reportError(
                new GraphQLError(
                  `Space argument must be of type String`,
                  argument
                )
              );
            }
            break;

          case 'container':
            if (!argumentIsString(argument)) {
              context.reportError(
                new GraphQLError(
                  `Container argument must be of type String`,
                  argument
                )
              );
            }
            break;

          case 'containerPropertyIdentifier':
            if (!argumentIsString(argument)) {
              context.reportError(
                new GraphQLError(
                  `containerPropertyIdentifier argument must be of type String`,
                  argument
                )
              );
            }
            break;
        }
      });
    }
  }

  function argumentIsString(argument: ArgumentNode) {
    return argument.value.kind === 'StringValue';
  }
}
