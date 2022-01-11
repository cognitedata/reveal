import {
  getFieldType,
  SchemaDefinitionNode,
} from '@platypus-app/utils/graphql-utils';
import { FieldDefinitionNode } from 'graphql';
import styled, { css } from 'styled-components';
import { Link, Node } from '../Graph/Graph';
import { getConnectorHeight, getNodeWidth } from './utils';

export const connectorsGenerator =
  (
    nodes: (Node & SchemaDefinitionNode)[],
    links: Link[],
    showHeaderOnly: boolean,
    showRequiredIcon: boolean
  ) =>
  (
    item: d3.SimulationNodeDatum & {
      id: string;
      title: string;
    } & SchemaDefinitionNode,
    displayedNodes?: (d3.SimulationNodeDatum & {
      id: string;
      title: string;
    } & SchemaDefinitionNode)[]
  ) => {
    const nodeWidth = getNodeWidth(item, showRequiredIcon);
    const indicators: React.ReactNode[] = [];

    const linkedSchemaIds = new Set<string>();

    // get all of the links for this schema
    links.forEach((link) => {
      if (link.target === item.id) {
        linkedSchemaIds.add(link.source);
      } else if (link.source === item.id) {
        linkedSchemaIds.add(link.target);
      }
    });

    if (item.kind === 'ObjectTypeDefinition') {
      // for Object types, go through each property that has a link outwards and draw an indicator
      item.fields?.forEach((field: FieldDefinitionNode, index) => {
        const linkedSchema = nodes.find(({ name }) =>
          getFieldType(field.type).includes(name.value)
        );
        if (linkedSchema) {
          linkedSchemaIds.delete(linkedSchema.id);
          const linkedSchemaNode = displayedNodes
            ? displayedNodes.find((el) => el.id === linkedSchema.id)
            : undefined;
          indicators.push(
            <ConnectorIndicator
              className="z-2"
              key={field.name.value}
              top={getConnectorHeight(showHeaderOnly ? -1 : index)}
              left={(linkedSchemaNode?.x || 0) > (item.x || 1) ? nodeWidth : 0}
            />
          );
        }
      });
    }

    // all leftover linkages are referenced indirectly
    Array.from(linkedSchemaIds).forEach((id) => {
      const linkedSchemaNode = displayedNodes
        ? displayedNodes.find((el) => el.id === id)
        : undefined;
      indicators.push(
        <ConnectorIndicator
          className="z-2"
          key={id}
          top={getConnectorHeight(-1)}
          left={(linkedSchemaNode?.x || 0) > (item.x || 1) ? nodeWidth : 0}
        />
      );
    });

    return indicators;
  };

const ConnectorIndicator = styled.div<{ top: number; left: number }>(
  (props) => css`
    position: absolute;
    top: ${props.top}px;
    left: ${props.left}px;
    border-radius: 50%;
    height: 10px;
    width: 10px;
    background: var(--cogs-purple-3);
    transform: translate(-50%, -50%);
  `
);
