/* eslint-disable  */
import { Change, diff } from '@graphql-inspector/core';
import { GraphQlSchemaParser } from '../../../common/graphql-schema-parser';
import { SchemaServiceGraphqlApiBuilder } from '../schemaservice/applicationAPI/schema-builder';

export function createMockServerKey(name, version) {
  return `${name}_${version}`;
}

export async function validateBreakingChanges(
  newSchema: string,
  oldSchema: string,
  operationName: string
) {
  const schemaBuilder = new SchemaServiceGraphqlApiBuilder();
  const parser = new GraphQlSchemaParser();

  const schemaOldGraphql = parser.buildGraphQlSchemaAst(
    `
    ${schemaBuilder.getBuiltInTypes()}
    ${schemaBuilder.sanitizeSchema(oldSchema)}
    `
  );

  const schemaNewGraphql = parser.buildGraphQlSchemaAst(
    `
    ${schemaBuilder.getBuiltInTypes()}
    ${schemaBuilder.sanitizeSchema(newSchema)}
    `
  );

  const changes: Change[] = await diff(schemaOldGraphql, schemaNewGraphql);
  // console.log('changes', changes);

  const breakingChanges =
    changes.filter((change) => change.criticality.level === 'BREAKING') || [];

  const typeChangeMap = {
    FIELD_TYPE_CHANGED: 'fieldTypeChanged',
    FIELD_REMOVED: 'fieldRemoved',
  };

  const regex = /.*(?<from>'.*')\sto\s(?<to>'.*')/gm;

  const getBreakingChangeInfo = (breakingChange: Change) => {
    let previousValue = null;
    let currentValue = null;

    if (breakingChange.type === 'FIELD_TYPE_CHANGED') {
      const regexMatches = regex.exec(breakingChange.message);

      if (regexMatches) {
        const { groups } = regexMatches;
        previousValue = groups.from ? groups.from.replace(/\'/g, '') : '';
        currentValue = groups.to ? groups.to.replace(/\'/g, '') : '';
      } else {
        previousValue = breakingChange.path.split('.')[1];
      }
    }

    return {
      currentValue,
      fieldName: breakingChange.path.split('.')[1],
      previousValue,
      typeName: breakingChange.path.split('.')[0],
      typeOfChange: breakingChange.type,
    };
  };

  return breakingChanges && breakingChanges.length
    ? breakingChanges.map((breakingChange) => ({
        extensions: {
          breakingChangeInfo: getBreakingChangeInfo(breakingChange),
          classification: 'DataFetchingException',
        },
        locations: [],
        message: breakingChange.message,
        path: [operationName],
      }))
    : [];
}
