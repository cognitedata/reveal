import { GetOffsetFunction, Node } from '../Graph/Graph';
import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { getFieldType, SchemaDefinitionNode } from '../../utils/graphql-utils';

export const NODE_WIDTH = 240;
export const NODE_ICON_WIDTH = 20;
export const NODE_HEADER_HEIGHT = 40;
export const NODE_PROPERTY_ITEM_HEIGHT = 28;

type GetOffsetFnParams = Parameters<
  GetOffsetFunction<Node & SchemaDefinitionNode>
>;

export const isDisplayedNodesOverlapping = (
  origNodes: (SimulationNodeDatum & {
    id: string;
    title: string;
  } & ObjectTypeDefinitionNode)[],
  scale: number
) => {
  const nodes = origNodes.slice();
  while (nodes.length !== 0) {
    const item = nodes.pop()!;
    const hasOverlap = nodes.some((node) => {
      const nodeX = (node.x || 0) * scale;
      const nodeY = (node.y || 0) * scale;
      const itemX = (item.x || 0) * scale;
      const itemY = (item.y || 0) * scale;

      const nodeWidth = NODE_WIDTH;
      const nodeHeight =
        NODE_HEADER_HEIGHT +
        (node.fields?.length || 0) * NODE_PROPERTY_ITEM_HEIGHT;

      const itemWidth = NODE_WIDTH;
      const itemHeight =
        NODE_HEADER_HEIGHT +
        (item.fields?.length || 0) * NODE_PROPERTY_ITEM_HEIGHT;

      return (
        // node max X > item min X
        nodeX + nodeWidth > itemX &&
        // node min X < item max X
        nodeX < itemX + itemWidth &&
        // node max Y > item min Y
        nodeY + nodeHeight > itemY &&
        // node min Y < item max Y
        nodeY < itemY + itemHeight
      );
    });
    if (hasOverlap) {
      return true;
    }
  }
  return false;
};

export const getConnectorHeight = (index: number) =>
  (index > -1 ? (index + 1) * NODE_PROPERTY_ITEM_HEIGHT : 0) +
  NODE_HEADER_HEIGHT / 2;

export const getOffset = (d: GetOffsetFnParams[0]) => (
  showHeaderOnly = false,
  showRequiredIcon = false,
  showSearchIcon = false
) => {
  const sourceNode = d.source as SchemaDefinitionNode & Node;
  const targetNode = d.target as SchemaDefinitionNode & Node;

  const sourceNodeName = sourceNode.name.value;
  const targetNodeName = targetNode.name.value;

  const sourceNodeWidth = getNodeWidth(
    sourceNode,
    showRequiredIcon,
    showSearchIcon
  );

  const targetNodeWidth = getNodeWidth(
    targetNode,
    showRequiredIcon,
    showSearchIcon
  );

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
      y: getConnectorHeight(showHeaderOnly ? -1 : sourcePropertyIndex || 0) * 1,
    },
    target: {
      x: (sourceNode.x || 0) > (targetNode.x || 0) ? targetNodeWidth : 0,
      y: getConnectorHeight(showHeaderOnly ? -1 : targetPropertyIndex || 0) * 1,
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

export const getNodeWidth = (
  node: SchemaDefinitionNode & Node,
  requiredFilter: boolean,
  searchFilter: boolean
) => {
  const hasRequiredFilter =
    requiredFilter && doesNodeHaveDirective(node, 'required');
  const hasSearchFilter = searchFilter && doesNodeHaveDirective(node, 'search');

  return (
    NODE_WIDTH +
    (hasRequiredFilter ? NODE_ICON_WIDTH : 0) +
    (hasSearchFilter ? NODE_ICON_WIDTH : 0)
  );
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
