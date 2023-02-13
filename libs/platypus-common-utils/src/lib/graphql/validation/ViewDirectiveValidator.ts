import {
  ArgumentNode,
  ASTVisitor,
  DirectiveNode,
  GraphQLError,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  ValidationContext,
} from 'graphql';

export function ViewDirectiveValidator(context: ValidationContext): ASTVisitor {
  return {
    ObjectTypeDefinition: validateNode,
    InterfaceTypeDefinition: validateNode,
  };

  function validateNode(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    if (node.directives) {
      node.directives.forEach((directive) => {
        if (directive.name.value === 'view') {
          validateViewDirective(directive);
        }
      });
    }
  }

  function validateViewDirective(directive: DirectiveNode) {
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

          case 'version':
            if (!argumentIsString(argument)) {
              context.reportError(
                new GraphQLError(
                  `Version argument must be of type string`,
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
