import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
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
