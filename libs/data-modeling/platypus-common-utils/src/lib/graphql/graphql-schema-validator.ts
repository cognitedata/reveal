import {
  DataModelValidationError,
  IGraphQlSchemaValidator,
  GraphQlValidationResult,
  ValidationRule,
} from '@platypus/platypus-core';
import {
  DocumentNode,
  GraphQLError,
  buildSchema,
  parse,
  validateSchema,
} from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import { fieldDefinitionApi, objectTypeApi } from 'graphql-extra';
import { validateWithCustomRules } from 'graphql-language-service';

import { getBuiltInTypesString } from './utils';
import { ContainerDirectiveValidator } from './validation/ContainerDirectiveValidator';
import { FieldNodeValidator } from './validation/FieldNodeValidator';
import { NotSupportedFeaturesRule } from './validation/NotSupportedFeaturesRule';

export class GraphQlSchemaValidator
  extends ValidationRule
  implements IGraphQlSchemaValidator
{
  validate(graphQlString: string): GraphQlValidationResult {
    if (graphQlString === '') {
      return {
        valid: false,
        errors: [
          {
            message: 'Your Data Model Schema is empty',
            errorMessage: 'Your Data Model Schema is empty',
            status: 400,
          },
        ],
      };
    }

    // we need this to be able to parse and validate the schema properly
    const queryType = `type Query {
        test: String
      }`;

    const schemaToValidate =
      graphQlString + getBuiltInTypesString() + queryType;

    const customValidationRules = [
      NotSupportedFeaturesRule,
      FieldNodeValidator,
      ContainerDirectiveValidator,
    ];

    let errors: GraphQLError[] = [];
    let doc: DocumentNode | null = null;

    try {
      doc = parse(schemaToValidate);
      errors = validateSDL(doc).slice();
      if (errors.length) {
        return {
          valid: false,
          errors: errors.map((err) => this.graphQlToValidationError(err)),
        };
      }
      errors = validateSchema(buildSchema(schemaToValidate)).slice();
      if (errors.length) {
        return {
          valid: false,
          errors: errors.map((err) => {
            const locations = err.locations?.slice(1);
            const newGQLError = {
              ...err,
              locations,
            } as unknown as GraphQLError;
            return this.graphQlToValidationError(newGQLError);
          }),
        };
      }
      errors = validateWithCustomRules(
        buildSchema(schemaToValidate),
        doc,
        customValidationRules
      );
    } catch (err) {
      if (err instanceof GraphQLError) {
        errors = [err];
      }
    }
    return {
      valid: !errors.length,
      errors: errors.map((err) => this.graphQlToValidationError(err)),
    };
  }

  private graphQlToValidationError(
    error: GraphQLError
  ): DataModelValidationError {
    let typeName: string | undefined = undefined;
    let fieldName: string | undefined = undefined;

    if (error.nodes?.length) {
      const node = error.nodes[0];

      if (node.kind === 'ObjectTypeDefinition') {
        const typeDef = objectTypeApi(node);
        typeName = typeDef.getName();

        if (node.fields?.length) {
          const fieldDef = fieldDefinitionApi(node.fields[0]);
          fieldName = fieldDef.getName();
        }
      }
    }
    return {
      message: error.message,
      status: 400,
      errorMessage: error.message,
      typeName,
      fieldName,
      locations: error.locations?.map((loc) => ({
        line: loc.line,
        column: loc.column,
      })),
    };
  }
}
