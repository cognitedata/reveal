import { DataModelTypeDefsType } from '@fusion/data-modeling';
import { SimulationLinkDatum } from 'd3';

import { Node } from '../Graph/GraphEngine';

export const NODE_WIDTH = 240;
export const NODE_ICON_WIDTH = 20;
export const NODE_HEADER_HEIGHT = 40;
export const NODE_PROPERTY_ITEM_HEIGHT = 28;

export const getConnectorHeight = (index: number) =>
  (index > -1 ? (index + 1) * NODE_PROPERTY_ITEM_HEIGHT : 0) +
  NODE_HEADER_HEIGHT / 2;

export const getLinkEndOffset =
  (d: SimulationLinkDatum<Node & DataModelTypeDefsType>) =>
  (showHeaderOnly = false) => {
    const sourceNode = d.source as DataModelTypeDefsType & Node;
    const targetNode = d.target as DataModelTypeDefsType & Node;

    const sourceNodeName = sourceNode.name;
    const targetNodeName = targetNode.name;

    const sourceNodeWidth = getNodeWidth(sourceNode);

    const targetNodeWidth = getNodeWidth(targetNode);

    const sourcePropertyIndex =
      sourceNode.kind === 'type'
        ? sourceNode.fields?.findIndex((el) =>
            el.type.name.includes(targetNodeName)
          )
        : -1;
    const targetPropertyIndex =
      targetNode.kind === 'type'
        ? targetNode.fields?.findIndex((el) =>
            el.type.name.includes(sourceNodeName)
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
  d: SimulationLinkDatum<DataModelTypeDefsType & Node>
) => {
  const sourceNode = d.source as DataModelTypeDefsType & Node;
  const targetNode = d.target as DataModelTypeDefsType & Node;

  const sourceNodeName = sourceNode.name;
  const targetNodeName = targetNode.name;

  // for Object types, the height could be tied to the property type
  const sourceProperty =
    sourceNode.kind === 'type'
      ? sourceNode.fields?.find((el) => el.type.name.includes(targetNodeName))
      : undefined;
  const targetProperty =
    targetNode.kind === 'type'
      ? targetNode.fields?.find((el) => el.type.name.includes(sourceNodeName))
      : undefined;

  const sourceItemString = `${sourceNodeName}${
    sourceProperty ? `.${sourceProperty.name}` : ''
  }`;
  const targetItemString = `${targetNodeName}${
    targetProperty ? `.${targetProperty.name}` : ''
  }`;

  return `${sourceItemString} -> ${targetItemString}`;
};

export const getNodeWidth = (_node: DataModelTypeDefsType & Node) => {
  return NODE_WIDTH;
};

export const getTypeDirective = (item: DataModelTypeDefsType): string => {
  if (!item.directives || !item.directives.length) {
    if (item.kind === 'interface') {
      return 'Interface';
    }
    return 'Type';
  }

  return item.directives[0].name;
};

export const capitalizeFirst = (text: string): string =>
  text.substring(0, 1).toUpperCase() + text.substring(1);

export const getNodeId = (type: DataModelTypeDefsType) => {
  return `${type.name}-${type.kind === 'type' ? type.fields?.length : ''}`;
};
