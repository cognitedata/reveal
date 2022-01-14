import { Body, Icon, Label, Title, Tooltip } from '@cognite/cogs.js';
import {
  getFieldType,
  renderFieldType,
} from '@platypus-app/utils/graphql-utils';
import { InputValueDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import styled from 'styled-components';
import { isTypeATemplate } from '../utils';
import { Header } from './Common';

export const FullNode = ({ item }: { item: ObjectTypeDefinitionNode }) => {
  return (
    <>
      <Header>
        <Title level={5} style={{ flex: 1 }}>
          {item.name.value}
        </Title>
        <Label
          variant={isTypeATemplate(item) ? 'normal' : 'unknown'}
          size="small"
        >
          {isTypeATemplate(item) ? 'Template' : 'Type'}
        </Label>
      </Header>
      {item.fields?.map((el) => (
        <PropertyItem key={el.name.value}>
          <Body level={2} className="property-name">
            {getFieldType(el.type) === 'ID' ? (
              <StyledMainID>{el.name.value}</StyledMainID>
            ) : (
              el.name.value
            )}
          </Body>
          <div className="property-type">
            {el.arguments && el.arguments.length > 0 && (
              <Tooltip placement="bottom" content={renderTooltip(el.arguments)}>
                <Icon type="Filter" className="filter-details" />
              </Tooltip>
            )}
            <Body level={2}>{renderFieldType(el.type)}</Body>
          </div>
        </PropertyItem>
      ))}
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

const PropertyItem = styled.div`
  display: flex;
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
    > * {
      margin-left: 6px;
    }
    .filter-details {
      display: flex;
      color: var(--cogs-text-hint);
    }
  }
`;
