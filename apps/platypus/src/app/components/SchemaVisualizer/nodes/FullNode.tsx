import styled from 'styled-components';

import {
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql';

import { Body, Icon, Chip, Title, Tooltip } from '@cognite/cogs.js';

import { getFieldType, renderFieldType } from '../../../utils/graphql-utils';
import {
  getTypeDirective,
  capitalizeFirst,
  NODE_PROPERTY_ITEM_HEIGHT,
} from '../utils';

import { Header } from './Common';

export const FullNode = ({
  item,
  fullRender = true,
}: {
  item: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode;
  fullRender?: boolean;
  isInterface?: boolean;
}) => {
  const typeDirective = getTypeDirective(item);

  return (
    <>
      <Header>
        <Title level={5} style={{ flex: 1 }}>
          {item.name.value}
        </Title>
        <StyledLabel
          type="default"
          size="x-small"
          label={capitalizeFirst(typeDirective)}
        />
      </Header>
      {fullRender ? (
        item.fields?.map((el) => (
          <PropertyItem key={el.name.value} data-cy="visualizer-type-field">
            <Body level={2} className="property-name">
              {getFieldType(el.type) === 'ID' ? (
                <StyledMainID>{el.name.value}</StyledMainID>
              ) : (
                el.name.value
              )}
            </Body>
            <div className="property-type">
              {el.arguments && el.arguments.length > 0 && (
                <Tooltip
                  placement="bottom"
                  content={renderTooltip(el.arguments)}
                >
                  <Icon type="Filter" />
                </Tooltip>
              )}
              <Body level={2}>{renderFieldType(el.type)}</Body>
            </div>
          </PropertyItem>
        ))
      ) : (
        <div
          style={{
            marginTop: 8,
            height: (item.fields?.length || 0) * NODE_PROPERTY_ITEM_HEIGHT,
            background: 'var(--cogs-greyscale-grey2)',
          }}
        />
      )}
    </>
  );
};

const renderTooltip = (args: readonly InputValueDefinitionNode[]) => {
  return (
    <>
      {args.map((arg) => (
        <Body
          key={arg.name.value}
          level={2}
          style={{ color: 'var(--cogs-text-inverted)' }}
        >{`${arg.name.value}: ${renderFieldType(arg.type)}`}</Body>
      ))}
    </>
  );
};

const StyledMainID = styled.span`
  display: inline-block;
  padding: 0 0.1rem;
  color: var(--cogs-white);
  border-radius: 1px;
  background-color: var(--cogs-greyscale-grey7);
`;
const StyledLabel = styled(Chip)`
  height: 20px;
  width: auto;
  ${(props) => props.type === 'default' && 'color: var(--cogs-midblue-1);'}
`;

const PropertyItem = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  .cogs-body-2 {
    color: var(--cogs-text-hint);
  }
  .property-name.cogs-body-2 {
    color: var(--cogs-text-primary);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .property-type {
    text-align: end;
    display: flex;
    align-items: center;
    .filter-details {
      display: flex;
      color: var(--cogs-text-hint);
    }
  }
`;
