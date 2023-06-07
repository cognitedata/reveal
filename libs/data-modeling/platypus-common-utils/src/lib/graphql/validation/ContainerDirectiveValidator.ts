import {
  ArgumentNode,
  ASTVisitor,
  DirectiveNode,
  GraphQLError,
  ValidationContext,
  Kind,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
} from 'graphql';

export function ContainerDirectiveValidator(
  context: ValidationContext
): ASTVisitor {
  return {
    InterfaceTypeDefinition: ValidateTypeDefinition,
    ObjectTypeDefinition: ValidateTypeDefinition,
  };

  function ValidateTypeDefinition(
    node: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
  ) {
    if (node.directives) {
      node.directives.forEach((directive) => {
        if (directive.name.value === 'container') {
          validateContainerDirective(directive);
        }
      });
    }
  }

  function validateContainerDirective(directive: DirectiveNode) {
    if (directive.arguments) {
      directive.arguments.forEach((argument) => {
        if (argument.name.value === 'constraints') {
          validateConstraints(argument);
        }
      });
    }
  }
  function validateConstraints(argument: ArgumentNode) {
    if (argument.value.kind === Kind.LIST) {
      const constraintObject = argument.value.values.find(
        (node) => node.kind === Kind.OBJECT
      );
      if (constraintObject && constraintObject.kind === Kind.OBJECT) {
        const constraintTypeProperty = constraintObject.fields.find(
          (field) => field.name.value === 'constraintType'
        );
        const fieldsProperty = constraintObject.fields.find(
          (field) => field.name.value === 'fields'
        );
        const requireProperty = constraintObject.fields.find(
          (field) => field.name.value === 'require'
        );

        if (
          constraintTypeProperty &&
          constraintTypeProperty.value.kind === Kind.ENUM
        ) {
          if (
            constraintTypeProperty.value.value === 'REQUIRES' &&
            !requireProperty
          ) {
            context.reportError(
              new GraphQLError(
                'require property of type object with space & externalId must be set for constraintType REQUIRES',
                {
                  nodes: [constraintTypeProperty.value],
                }
              )
            );
          }
          if (
            constraintTypeProperty.value.value === 'UNIQUENESS' &&
            !fieldsProperty
          ) {
            context.reportError(
              new GraphQLError(
                'fields property of type list with field names must be set for constraintType UNIQUENESS',
                {
                  nodes: [constraintTypeProperty.value],
                }
              )
            );
          }
        }
      }
    }
  }
}
