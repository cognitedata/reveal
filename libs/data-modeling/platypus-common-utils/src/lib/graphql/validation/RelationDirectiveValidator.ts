import {
  ArgumentNode,
  ASTVisitor,
  DirectiveNode,
  EnumValueNode,
  FieldDefinitionNode,
  GraphQLError,
  ValidationContext,
} from 'graphql';

export function RelationDirectiveValidator(
  context: ValidationContext
): ASTVisitor {
  return {
    FieldDefinition: ValidateFieldDefinition,
  };

  function ValidateFieldDefinition(node: FieldDefinitionNode) {
    if (node.directives) {
      node.directives.forEach((directive) => {
        if (directive.name.value === 'relation') {
          validateRelationDirective(directive);
        }
      });
    }
  }

  function validateRelationDirective(directive: DirectiveNode) {
    if (directive.arguments) {
      directive.arguments.forEach((argument) => {
        switch (argument.name.value) {
          case 'type':
            validateTypeProperty(argument);
            break;

          case 'direction':
            if (argument.value.kind !== 'EnumValue') {
              context.reportError(
                new GraphQLError(
                  `Direction argument must be an enum value of either OUTWARDS or INWARDS.`,
                  argument
                )
              );
              break;
            }
            if (
              (argument.value as EnumValueNode).value !== 'OUTWARDS' &&
              (argument.value as EnumValueNode).value !== 'INWARDS'
            ) {
              context.reportError(
                new GraphQLError(
                  `Direction argument must be an enum value of either OUTWARDS or INWARDS.`,
                  argument
                )
              );
            }
            break;
        }
      });
    }
  }

  function validateTypeProperty(argument: ArgumentNode) {
    if (argument.value.kind !== 'ObjectValue') {
      context.reportError(
        new GraphQLError(
          `Type argument must be an object with space and externalId properties`,
          argument
        )
      );
    } else {
      const spaceField = argument.value.fields.find(
        (field) => field.name.value === 'space'
      );
      if (!spaceField) {
        context.reportError(
          new GraphQLError(
            'type argument object is missing the property space property',
            argument
          )
        );
      } else {
        if (spaceField.value.kind !== 'StringValue') {
          context.reportError(
            new GraphQLError('space property must be of type String', argument)
          );
        }
      }

      const externalIdField = argument.value.fields.find(
        (field) => field.name.value === 'externalId'
      );
      if (!externalIdField) {
        context.reportError(
          new GraphQLError(
            'type argument object is missing the externalId property',
            argument
          )
        );
      } else {
        if (externalIdField.value.kind !== 'StringValue') {
          context.reportError(
            new GraphQLError(
              'externalId property must be of type String',
              argument
            )
          );
        }
      }
    }
  }
}
