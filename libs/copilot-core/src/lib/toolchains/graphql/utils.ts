/* eslint-disable no-template-curly-in-string */
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import dayjs from 'dayjs';
import { FieldNode, Kind, parse, print, visit } from 'graphql';

const additionalFields: FieldNode[] = [
  {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: '__typename' },
  },
  {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: 'externalId' },
  },
];
const additionalFieldsForRelations: FieldNode[] = [
  {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: 'space' },
  },
  ...additionalFields,
];

export const augmentQueryWithRequiredFields = (
  query: string,
  dataModelTypeDefs: DataModelTypeDefs
  // list values - relationships
  // expandMultiFields = ['manyRelations']
) => {
  const editedQuery = visit(parse(query), {
    enter: (node, _key, parent) => {
      switch (node.kind) {
        case Kind.OPERATION_DEFINITION: {
          const field = node.selectionSet.selections[0];
          if (field.kind === Kind.FIELD) {
            let name = field.name.value;
            // we skip for aggregate!
            if (field.name.value.startsWith('list')) {
              name = field.name.value.substring('list'.length);
            }
            if (field.name.value.startsWith('search')) {
              name = field.name.value.substring('search'.length);
            } else if (field.name.value.startsWith('get')) {
              name = field.name.value.substring(
                'get'.length,
                field.name.value.length - 'ById'.length
              );
            }
            return {
              ...node,
              dataType: dataModelTypeDefs.types.find((el) => el.name === name),
            };
          }
          break;
        }
        default: {
          if (!parent) {
            return node;
          } else if ('length' in parent) {
            return {
              ...node,
              dataType: (
                parent.find((el) => 'dataType' in el) as {
                  dataType?: DataModelTypeDefsType;
                }
              )?.dataType,
            };
          }
          const dataType = (parent as { dataType?: DataModelTypeDefsType })
            .dataType;
          return {
            ...node,
            dataType: dataType,
          };
        }
      }
      return node;
    },
    Field: {
      enter: (
        node: FieldNode & { dataType?: DataModelTypeDefsType },
        _key,
        _parent,
        _path,
        ancestors
      ) => {
        if (node.selectionSet) {
          const reversedAncestors = [...ancestors].reverse();
          const dataType = (
            reversedAncestors.find(
              (el) => (el as { dataType?: DataModelTypeDefsType }).dataType
            ) as { dataType?: DataModelTypeDefsType }
          )?.dataType;
          const fieldDef = dataType?.fields.find(
            (field) => field.name === node.name.value
          );
          // for relationships (1-m is on items level);
          if (
            (fieldDef?.type.custom && !fieldDef?.type.list) ||
            (node.name.value === 'items' && !fieldDef)
          ) {
            // add additional fields
            const newNode = Object.assign({}, node.selectionSet);
            (newNode.selections as FieldNode[]).push(
              ...additionalFieldsForRelations
            );
            return {
              ...node,
              selectionSet: newNode,
              dataType: fieldDef
                ? dataModelTypeDefs.types.find(
                    (el) => el.name === fieldDef.type.name
                  )
                : undefined,
            };
          }
          // for timeseries type
          if (fieldDef?.type.name === 'TimeSeries') {
            // add additional fields (no space)
            const newNode = Object.assign({}, node.selectionSet);
            (newNode.selections as FieldNode[]).push(...additionalFields);
            return {
              ...node,
              selectionSet: newNode,
            };
          }
        }
        return node;
      },
    },
  });

  return print(editedQuery);
};

export type QueryType = 'list' | 'search' | 'aggregate' | 'get';

export const getOperationName = (queryType: QueryType, type: string) => {
  switch (queryType) {
    case 'get':
      return `get${type}ById`;
    default:
      return `${queryType}${type}`;
  }
};

export const getFilterTypeName = (queryType: QueryType, type: string) => {
  switch (queryType) {
    case 'search':
    case 'aggregate':
      return `_Search${type}Filter`;
    case 'list':
      return `_List${type}Filter`;
    default:
      return '';
  }
};

export const getFields = (
  typeName: string,
  relevantFields: Map<string, string[]>,
  dataModelTypes: DataModelTypeDefs,
  isList?: boolean
) => {
  const typeDef = dataModelTypes.types.find((el) => el.name === typeName);
  if (!typeDef) {
    throw Error('Unknown type for building fields for');
  }
  const nestedSet = new Map(relevantFields);
  nestedSet.delete(typeName);
  const fields = relevantFields.get(typeName);
  return `{
    ${isList ? 'items { externalId \n' : 'externalId\n'}
      ${typeDef?.fields
        .filter((field) => fields?.includes(field.name))
        .map((field): string => {
          if (field.type.custom) {
            if (nestedSet.has(field.type.name)) {
              return `${field.name} ${getFields(
                field.type.name,
                nestedSet,
                dataModelTypes,
                field.type.list
              )}`;
            }
            // skip, knowing we need to add dependecy checks later
            return '';
          }
          return field.name;
        })
        .join('\n')}
    ${isList ? '}' : ''}
  }`;
};

export type GptGQLFilter = {
  [key in string]: {
    property: string;
    operator: 'eq' | 'in' | 'prefix' | 'lt' | 'lte' | 'gt' | 'gte';
    value: string;
  }[];
};

export const constructFilter = (
  filter: GptGQLFilter,
  type: string,
  dataModelTypeDefs: DataModelTypeDefs
) => {
  const baseLevelOp = Object.keys(filter)[0];

  const omitted: { key: string; reason: string }[] = [];

  const filterContent = filter[baseLevelOp]
    .filter((el) => {
      if (
        !['prefix', 'eq', 'gt', 'gte', 'lt', 'lte', 'isNull'].includes(
          el.operator
        )
      ) {
        omitted.push({ key: el.property, reason: 'invalid filter' });
        return false;
      }
      const path = el.property.split('.');
      let typeDef = dataModelTypeDefs.types.find((el) => el.name === type);
      for (let i = 0; i < path.length; i += 1) {
        const currField = typeDef?.fields.find((el) => el.name === path[i]);
        if (!currField) {
          omitted.push({ key: el.property, reason: 'invalid field' });
          return false;
        }
        if (i !== path.length - 1) {
          if (!currField.type.custom) {
            // no support for timeseries
            omitted.push({
              key: el.property,
              reason: 'invalid filter on primitive field',
            });
            return false;
          }
          if (currField.type.list) {
            omitted.push({
              key: el.property,
              reason: '1-m relationship filtering not supported',
            });
            return false;
          }
          typeDef = dataModelTypeDefs.types.find(
            (el) => el.name === currField.type.name
          );
        }
      }
      return true;
    })
    .map((el) => {
      // TODO add validation of valid property
      let value = `${el.value}`;
      if (typeof el.value === 'string') {
        switch (el.value.toLowerCase().trim()) {
          case '${lastyear}$':
            value = dayjs().subtract(1, 'year').toISOString();
            break;
          case '${lastweek}$':
            value = dayjs().subtract(1, 'week').toISOString();
            break;
          case '${yearstart}$':
            value = dayjs().set('date', 1).set('month', 1).toISOString();
            break;
          case '${today}$':
            value = dayjs().toISOString();
            break;
        }
      }
      const path = el.property.split('.');
      return path.reduceRight((prev, currPath, i) => {
        if (i === path.length - 1) {
          return { [currPath.trim()]: { [el.operator]: value } };
        }
        return { [currPath.trim()]: prev };
      }, {} as any);
    });

  return {
    filter:
      filterContent.length > 0
        ? {
            [baseLevelOp === 'or' ? 'or' : 'and']: filterContent,
          }
        : null,
    omitted,
  };
};

export const constructGraphQLTypes = (
  types: string[],
  dataModelTypes: DataModelTypeDefs
) => {
  return `\`\`\`graphql
${dataModelTypes.types
  .filter((type) => types.includes(type.name))
  .map(
    (type) => `type ${type.name} {
  ${type.fields
    .map(
      (field) =>
        `${field.name}: ${field.list ? '[' : ''} ${field.type.name} ${
          field.list ? ']' : ''
        }`
    )
    .join('\n')}
}`
  )
  .join('\n')}
\`\`\``;
};
