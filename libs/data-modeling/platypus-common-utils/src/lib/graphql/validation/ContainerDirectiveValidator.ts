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
        switch (argument.name.value) {
          case 'constraints':
            validateConstraints(argument);
            break;

          case 'indexes':
            validateIndexes(argument);
            break;
          default:
            context.reportError(
              new GraphQLError(
                'constraints or indexes argument should be provided for @container',
                {
                  nodes: [argument],
                }
              )
            );
        }
      });
    }
  }
  function validateIndexes(argument: ArgumentNode) {
    if (argument.value.kind !== Kind.LIST) {
      context.reportError(
        new GraphQLError(`indexes argument must be a list type`, {
          nodes: [argument.value],
        })
      );
    } else {
      const indexesObject = argument.value.values.find(
        (node) => node.kind === Kind.OBJECT
      );
      if (!indexesObject || indexesObject.kind !== Kind.OBJECT) {
        context.reportError(
          new GraphQLError(
            'indexes argument property inside list must be an object',
            {
              nodes: [indexesObject || argument.value],
            }
          )
        );
      } else {
        const identifierProperty = indexesObject.fields.find(
          (field) =>
            field.name.value === 'identifier' &&
            field.value.kind === Kind.STRING
        );
        const indexTypeProperty = indexesObject.fields.find(
          (field) => field.name.value === 'indexType'
        );
        const fieldsProperty = indexesObject.fields.find(
          (field) => field.name.value === 'fields'
        );

        if (!identifierProperty)
          context.reportError(
            new GraphQLError(
              'identifier property is required and must be of type String',
              {
                nodes: [argument.value],
              }
            )
          );
        if (
          (indexTypeProperty && indexTypeProperty.value.kind !== Kind.ENUM) ||
          (indexTypeProperty &&
            indexTypeProperty.value.kind === Kind.ENUM &&
            indexTypeProperty.value.value !== 'BTREE')
        ) {
          context.reportError(
            new GraphQLError('indexType property must be of type enum BTREE', {
              nodes: [indexTypeProperty.value],
            })
          );
        }
        if (!fieldsProperty) {
          context.reportError(
            new GraphQLError('fields property is required', {
              nodes: [argument.value],
            })
          );
        }
        if (fieldsProperty && fieldsProperty.value.kind !== Kind.LIST) {
          context.reportError(
            new GraphQLError('fields property must be of type list', {
              nodes: [fieldsProperty.value],
            })
          );
        }
        if (
          fieldsProperty &&
          fieldsProperty.value.kind === Kind.LIST &&
          (fieldsProperty.value.values.some((v) => v.kind !== Kind.STRING) ||
            fieldsProperty.value.values.length === 0)
        ) {
          context.reportError(
            new GraphQLError(
              'fields names must be string and cannot be empty ',
              {
                nodes: [fieldsProperty.value],
              }
            )
          );
        }
      }
    }
  }
  function validateConstraints(argument: ArgumentNode) {
    if (argument.value.kind !== Kind.LIST) {
      context.reportError(
        new GraphQLError(`constraints argument must be a list type`, {
          nodes: [argument.value],
        })
      );
    } else {
      const constraintObject = argument.value.values.find(
        (node) => node.kind === Kind.OBJECT
      );
      if (!constraintObject || constraintObject.kind !== Kind.OBJECT) {
        context.reportError(
          new GraphQLError(
            'constraints argument property inside list must be an object',
            {
              nodes: [constraintObject || argument.value],
            }
          )
        );
      } else {
        const identifierProperty = constraintObject.fields.find(
          (field) =>
            field.name.value === 'identifier' &&
            field.value.kind === Kind.STRING
        );
        const constraintTypeProperty = constraintObject.fields.find(
          (field) => field.name.value === 'constraintType'
        );
        const fieldsProperty = constraintObject.fields.find(
          (field) => field.name.value === 'fields'
        );
        const requireProperty = constraintObject.fields.find(
          (field) => field.name.value === 'require'
        );
        if (!identifierProperty)
          context.reportError(
            new GraphQLError(
              'identifier property is required and must be of type String',
              {
                nodes: [argument.value],
              }
            )
          );
        if (
          constraintTypeProperty &&
          constraintTypeProperty.value.kind === Kind.ENUM
        ) {
          if (
            constraintTypeProperty.value.value !== 'REQUIRES' &&
            constraintTypeProperty.value.value !== 'UNIQUENESS'
          ) {
            context.reportError(
              new GraphQLError(
                'constraintType must be enum of either REQUIRES  or UNIQUENESS',
                {
                  nodes: [constraintTypeProperty.value],
                }
              )
            );
          }
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
          if (fieldsProperty && fieldsProperty.value.kind !== Kind.LIST) {
            context.reportError(
              new GraphQLError('fields property must be of type list', {
                nodes: [fieldsProperty.value],
              })
            );
          }
          if (
            fieldsProperty &&
            fieldsProperty.value.kind === Kind.LIST &&
            (fieldsProperty.value.values.some((v) => v.kind !== Kind.STRING) ||
              fieldsProperty.value.values.length === 0)
          ) {
            context.reportError(
              new GraphQLError(
                'fields property must be string and cannot be empty ',
                {
                  nodes: [fieldsProperty.value],
                }
              )
            );
          }
          if (requireProperty && requireProperty.value.kind !== Kind.OBJECT) {
            context.reportError(
              new GraphQLError('require property must be of type object', {
                nodes: [requireProperty.value],
              })
            );
          }
          if (requireProperty && requireProperty.value.kind === Kind.OBJECT) {
            if (requireProperty.value.fields.length === 0) {
              context.reportError(
                new GraphQLError(
                  `require properties should include space and externalId`,
                  {
                    nodes: [requireProperty.value],
                  }
                )
              );
            }
            requireProperty.value.fields.forEach((field) => {
              if (
                field.name.value !== 'externalId' &&
                field.name.value !== 'space'
              ) {
                context.reportError(
                  new GraphQLError(
                    `require properties should be space and externalId`,
                    {
                      nodes: [field.name],
                    }
                  )
                );
              }
              if (field.value.kind !== Kind.STRING) {
                context.reportError(
                  new GraphQLError(
                    `property ${field.name.value} must be a string`,
                    {
                      nodes: [field.value],
                    }
                  )
                );
              }
            });
          }
        }
      }
    }
  }
}
