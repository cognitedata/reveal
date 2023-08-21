/* eslint-disable no-template-curly-in-string */
import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  GraphQlDmlVersionDTO,
} from '@platypus/platypus-core';
import dayjs from 'dayjs';
import { FieldNode, Kind, parse, print, visit } from 'graphql';

import { addToCopilotLogs } from '../../utils/logging';

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
  isList?: boolean,
  includePageInfo?: boolean
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
        .filter(
          (field) =>
            fields?.includes(field.name) ||
            // always include externalId, name, description
            field.name === 'externalId' ||
            field.name === 'name' ||
            field.name === 'title' ||
            field.name === 'description'
        )
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
          if (field.type.name === 'TimeSeries') {
            return `${field.name} {
              id
              externalId
              __typename
              dataPoints {
                timestamp
                value
              }
            }`;
          }
          if (field.type.name === 'File' || field.type.name === 'Sequence') {
            return `${field.name} {
              id
              externalId
              __typename
            }`;
          }
          return field.name;
        })
        .join('\n')}
    ${isList ? '}' : ''}
    ${
      includePageInfo
        ? `
    pageInfo {
      hasNextPage
    }`
        : ''
    }
  }`;
};

type FilterItem = {
  property: string;
  operator: 'eq' | 'in' | 'prefix' | 'lt' | 'lte' | 'gt' | 'gte';
  value: string;
};

export type GptGQLFilter = {
  [key in string]: FilterItem[];
};

export const constructFilterForTypes = (
  key: string,
  filter: GptGQLFilter,
  types: string[],
  dataModelTypeDefs: DataModelTypeDefs
) => {
  if (types.length === 0) {
    throw new Error('Must have more than 1 type to build filter on');
  }
  const maps = getFilterMap(types, dataModelTypeDefs);
  let result = types.reduce(
    (
      prev: null | (ReturnType<typeof constructFilter> & { type: string }),
      el
    ) => {
      const currFilter = constructFilter(filter, el, dataModelTypeDefs, maps);
      addToCopilotLogs(key, {
        key: 'construct filter',
        content: `trying ${el} as primary\n\`\`\`json\n${JSON.stringify(
          currFilter,
          null,
          2
        )}\n\`\`\``,
      });
      if (prev === null) {
        return { type: el, ...currFilter };
      }
      if (prev.omitted.length > currFilter.omitted.length) {
        return { type: el, ...currFilter };
      }
      if (
        prev.omitted.length === currFilter.omitted.length &&
        currFilter.wildGuess > prev.wildGuess
      ) {
        return { type: el, ...currFilter };
      }
      return prev;
    },
    null
  );
  return result as ReturnType<typeof constructFilter> & { type: string };
};

const constructFilter = (
  filter: GptGQLFilter,
  type: string,
  dataModelTypeDefs: DataModelTypeDefs,
  { propertyLookup, relationLookup }: ReturnType<typeof getFilterMap>
) => {
  const baseLevelOp = Object.keys(filter)[0];

  const omitted: { key: string; reason: string }[] = [];

  let wildGuess = 0;

  const filterContent: any[] = [];

  (filter[baseLevelOp] || []).forEach((el) => {
    if (
      !['prefix', 'eq', 'gt', 'gte', 'lt', 'lte', 'isNull'].includes(
        el.operator
      )
    ) {
      omitted.push({ key: el.property, reason: 'invalid filter' });
      return;
    }
    const path = el.property.split('.');
    const filterPath = [];
    let typeDef = dataModelTypeDefs.types.find((el) => el.name === type);
    let currField = typeDef?.fields.find((el) => el.name === path[0]);
    for (let i = 0; i < path.length; i += 1) {
      // all the types that this property can belong to
      const typeForProperty = propertyLookup.get(path[i]);
      // if it is a relationship, the possible start / end type for this relatioship
      const relationshipForProperty = relationLookup.get(path[i]);

      currField = typeDef?.fields.find((el) => el.name === path[i]);
      // if the current field insnt a valid field for the given type
      if (!currField) {
        // look for potential target in case GPT gave us inconclusive property name (missing relationship)
        if (typeDef && typeForProperty) {
          const typeName = typeDef?.name;
          const potentialTarget = [...relationLookup.values()].find((el) =>
            el.some(
              ({ sourceType, destinationType, list }) =>
                // fdm limitation for the list check
                !list &&
                sourceType === typeName &&
                typeForProperty.includes(destinationType)
            )
          );
          if (potentialTarget) {
            // greedy guess, take the first possible relationship
            filterPath.push(potentialTarget[0].property);
            typeDef = dataModelTypeDefs.types.find(
              (el) => el.name === potentialTarget[0].destinationType
            );
            currField = typeDef?.fields.find(
              (el) => el.name === potentialTarget[0].property
            );
            wildGuess += 1;
          }
        }
      }
      const sourceType = relationshipForProperty?.find(
        (el) => el.destinationType === type
      )?.sourceType;
      if (sourceType) {
        // skip the extra specifier
        continue;
      }
      if (!currField) {
        omitted.push({ key: el.property, reason: 'invalid field' });
        return;
      }
      if (currField.type.list) {
        omitted.push({
          key: el.property,
          reason: '1-m relationship filtering not supported',
        });
        return;
      }
      if (['TimeSeries', 'File', 'Sequence'].includes(currField.type.name)) {
        omitted.push({
          key: el.property,
          reason: `filtering on ${currField.type.name} not supported`,
        });
        return;
      }
      filterPath.push(path[i]);
    }

    // TODO add validation of valid property
    let value: string | number = `${el.value}`;
    if (
      currField?.type.name.includes('Int') ||
      currField?.type.name.includes('Float')
    ) {
      value = Number(el.value);
      if (Number.isNaN(value)) {
        omitted.push({
          key: el.property,
          reason: `filters on ${currField.type.name} must be a valid number`,
        });
        return;
      }
    }
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
    filterContent.push(
      filterPath.reduceRight((prev, currPath, i) => {
        if (i === filterPath.length - 1) {
          return { [currPath.trim()]: { [el.operator]: value } };
        }
        return { [currPath.trim()]: prev };
      }, {} as any)
    );
  });
  return {
    filter:
      filterContent.length > 0
        ? {
            [baseLevelOp === 'or' ? 'or' : 'and']: filterContent,
          }
        : null,
    omitted,
    wildGuess,
  };
};
const getFilterMap = (
  types: string[],
  dataModelTypeDefs: DataModelTypeDefs
) => {
  const relevantTypes = dataModelTypeDefs.types.filter((el) =>
    types.includes(el.name)
  );
  const propertyLookup = new Map<string, string[]>();
  const relationLookup = new Map<
    string,
    {
      key: string;
      sourceType: string;
      destinationType: string;
      property: string;
      list: boolean;
    }[]
  >();

  for (const type of relevantTypes) {
    for (const field of type.fields) {
      propertyLookup.set(field.name, [
        ...(propertyLookup.get(field.name) || []),
        type.name,
      ]);
      if (!relationLookup.has(field.name) && field.type.custom) {
        const directiveDetails = field.directives
          // find relation directive if exist
          ?.find((el) => el.name === 'relation')
          // find the `type` argument
          ?.arguments?.find((el) => el.name === 'type')
          ?.value.fields.filter(
            // find the specific relation externalId
            (el: { name: { value: string } }) => el.name.value === 'externalId'
          )?.value?.value;
        // for each 'relation' field, we need to know the source and destination type
        relationLookup.set(field.name, [
          ...(relationLookup.get(field.name) || []),
          {
            sourceType: type.name,
            destinationType: field.type.name,
            key: directiveDetails || `${type.name}.${field.name}`,
            property: field.name,
            list: field.type.list || false,
          },
        ]);
      }
    }
  }
  return { propertyLookup, relationLookup };
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

export const getTypeString = (dataModels: GraphQlDmlVersionDTO[]) => {
  let typeNames = '';
  for (const dataModel of dataModels) {
    if (!dataModel.graphQlDml) {
      continue;
    }
    const dataModelTypes = new GraphQlUtilsService().parseSchema(
      dataModel.graphQlDml,
      dataModel.views
    );
    // Chain 1: Extract relevant types
    typeNames += `\n\n[${dataModel.externalId}_${dataModel.space}]\n`;
    typeNames += `\`\`\`graphql\n${dataModelTypes.types
      .map((el) => el.name)
      .join('\n')}\n\`\`\``;
  }
  return typeNames;
};

export const constructListResultSummary = (
  length: number,
  hasNextPage: boolean
) => {
  return `${length}${hasNextPage ? '+' : ''}`;
};

export const constructAggregateResultSummary = (
  items: ({
    group?: { [key in string]: string };
  } & {
    [key in 'sum' | 'count' | 'max' | 'min' | 'avg']?: {
      [key in string]: number | string;
    };
  })[]
) => {
  const summarizeData = (item: {
    [key in 'sum' | 'count' | 'max' | 'min' | 'avg']?: {
      [key in string]: number | string;
    };
  }) => {
    return Object.entries(item)
      .map(([key, entry]) => {
        if (key === 'group') {
          return '';
        }
        return Object.entries(entry)
          .map(([field, value]) => {
            return `${key} - "${field}": ${value}`;
          })
          .join(', ')
          .concat(' ');
      })
      .join('');
  };
  return `\n${items
    .map((item) => {
      return `- ${summarizeData(item)} in ${
        item.group
          ? Object.entries(item.group)
              .map(([key, value]) => `${key} of ${value}`)
              .join('\n')
          : ''
      }`;
    })
    .join('\n')
    .concat('\n')}`;
};
