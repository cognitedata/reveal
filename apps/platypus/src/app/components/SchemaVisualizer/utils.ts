import { SimulationLinkDatum } from 'd3';
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { GetOffsetFunction, Node } from '../Graph/Graph';
import { getFieldType, SchemaDefinitionNode } from '../../utils/graphql-utils';

export const NODE_WIDTH = 240;
export const NODE_ICON_WIDTH = 20;
export const NODE_HEADER_HEIGHT = 40;
export const NODE_PROPERTY_ITEM_HEIGHT = 28;

type GetOffsetFnParams = Parameters<
  GetOffsetFunction<Node & SchemaDefinitionNode>
>;

export const getConnectorHeight = (index: number) =>
  (index > -1 ? (index + 1) * NODE_PROPERTY_ITEM_HEIGHT : 0) +
  NODE_HEADER_HEIGHT / 2;

export const getOffset =
  (d: GetOffsetFnParams[0]) =>
  (showHeaderOnly = false) => {
    const sourceNode = d.source as SchemaDefinitionNode & Node;
    const targetNode = d.target as SchemaDefinitionNode & Node;

    const sourceNodeName = sourceNode.name.value;
    const targetNodeName = targetNode.name.value;

    const sourceNodeWidth = getNodeWidth(sourceNode);

    const targetNodeWidth = getNodeWidth(targetNode);

    const sourcePropertyIndex =
      sourceNode.kind === 'ObjectTypeDefinition'
        ? sourceNode.fields?.findIndex((el) =>
            getFieldType(el.type).includes(targetNodeName)
          )
        : -1;
    const targetPropertyIndex =
      targetNode.kind === 'ObjectTypeDefinition'
        ? targetNode.fields?.findIndex((el) =>
            getFieldType(el.type).includes(sourceNodeName)
          )
        : -1;

    return {
      source: {
        x: (targetNode.x || 0) > (sourceNode.x || 0) ? sourceNodeWidth : 0,
        y:
          getConnectorHeight(showHeaderOnly ? -1 : sourcePropertyIndex || 0) *
          1,
      },
      target: {
        x: (sourceNode.x || 0) > (targetNode.x || 0) ? targetNodeWidth : 0,
        y:
          getConnectorHeight(showHeaderOnly ? -1 : targetPropertyIndex || 0) *
          1,
      },
    };
  };

export const getLinkText = (
  d: SimulationLinkDatum<SchemaDefinitionNode & Node>
) => {
  const sourceNode = d.source as SchemaDefinitionNode & Node;
  const targetNode = d.target as SchemaDefinitionNode & Node;

  const sourceNodeName = sourceNode.name.value;
  const targetNodeName = targetNode.name.value;

  // for Object types, the height could be tied to the property type
  const sourceProperty =
    sourceNode.kind === 'ObjectTypeDefinition'
      ? sourceNode.fields?.find((el) =>
          getFieldType(el.type).includes(targetNodeName)
        )
      : undefined;
  const targetProperty =
    targetNode.kind === 'ObjectTypeDefinition'
      ? targetNode.fields?.find((el) =>
          getFieldType(el.type).includes(sourceNodeName)
        )
      : undefined;

  const sourceItemString = `${sourceNodeName}${
    sourceProperty ? `.${sourceProperty.name.value}` : ''
  }`;
  const targetItemString = `${targetNodeName}${
    targetProperty ? `.${targetProperty.name.value}` : ''
  }`;

  return `${sourceItemString} -> ${targetItemString}`;
};

export const getNodeWidth = (_node: SchemaDefinitionNode & Node) => {
  return NODE_WIDTH;
};

export const doesNodeHaveDirective = (
  node: SchemaDefinitionNode,
  directiveName: string
) =>
  (node.kind === 'ObjectTypeDefinition' &&
    node.fields?.some((field: FieldDefinitionNode) =>
      doesFieldHaveDirective(field, directiveName)
    )) ||
  false;

export const doesFieldHaveDirective = (
  field: FieldDefinitionNode,
  directiveName: string
) =>
  field.directives?.find((directive) => directive.name.value === directiveName);

export const isTypeATemplate = (item: ObjectTypeDefinitionNode) => {
  return item.directives?.some(
    (el) => el.name.value.toLowerCase() === 'template'
  );
};

export const getTypeDirective = (item: ObjectTypeDefinitionNode): string => {
  if (!item.directives || !item.directives.length) {
    return 'Type';
  }

  return item.directives[0].name.value;
};

export const capitalizeFirst = (text: string): string =>
  text.substring(0, 1).toUpperCase() + text.substring(1);
