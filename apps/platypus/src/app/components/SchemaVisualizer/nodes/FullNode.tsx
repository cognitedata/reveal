import { Body, Icon, IconType, Label, Title, Tooltip } from '@cognite/cogs.js';
import {
  getFieldType,
  renderFieldType,
} from '@platypus-app/utils/graphql-utils';
import { DirectiveBuiltInType } from '@platypus/platypus-core';
import { InputValueDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import styled from 'styled-components';
import {
  getTypeDirective,
  getFieldDirectives,
  capitalizeFirst,
} from '../utils';
import { Header } from './Common';

export const FullNode = ({
  item,
  isActive,
  knownTypeDirectives = [],
  knownFieldDirectives = [],
}: {
  item: ObjectTypeDefinitionNode;
  isActive: boolean;
  knownTypeDirectives?: DirectiveBuiltInType[];
  knownFieldDirectives?: DirectiveBuiltInType[];
}) => {
  const typeDirective = getTypeDirective(item);

  const isKnownType =
    knownTypeDirectives.length &&
    knownTypeDirectives.some((t) => t.name === typeDirective);

  return (
    <>
      <Header>
        <Title level={5} style={{ flex: 1 }}>
          {item.name.value}
        </Title>
        <StyledLabel variant={isKnownType ? 'normal' : 'unknown'} size="small">
          {isKnownType ? capitalizeFirst(typeDirective) : 'Type'}
        </StyledLabel>
      </Header>
      {item.fields?.map((el) => (
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
              <Tooltip placement="bottom" content={renderTooltip(el.arguments)}>
                <Icon type="Filter" className="filter-details" />
              </Tooltip>
            )}
            <Body level={2}>{renderFieldType(el.type)}</Body>
            {knownFieldDirectives.length > 0 && (
              <IconsWrapper className={isActive ? 'active' : ''}>
                {getFieldDirectives(el, knownFieldDirectives).map(
                  (fieldDirective, index) => {
                    return (
                      <div
                        key={fieldDirective.name + index}
                        aria-label={fieldDirective.name}
                        title={fieldDirective.name}
                        className="field-directive"
                      >
                        {fieldDirective.icon && (
                          <Icon type={fieldDirective.icon as IconType} />
                        )}
                      </div>
                    );
                  }
                )}
              </IconsWrapper>
            )}
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
const StyledLabel = styled(Label)`
  height: 20px;
  width: auto;
  color: #2b3a88;
`;
const IconsWrapper = styled.div`
  display: inline-block;
  overflow: hidden;
  margin-left: 6px;

  .field-directive {
    width: 20px;
    height: 20px;
    overflow: hidden;
    box-sizing: border-box;
    display: inline-block;
    background: var(--cogs-greyscale-grey2, #f5f5f5);
    border-radius: var(--cogs-border-radius--small, 4px);
    margin: 0px 2px;
    text-align: center;
    line-height: 20px;
    vertical-align: middle;
  }

  &.active .field-directive {
    background: rgba(74, 103, 251, 0.08);
  }

  .field-directive:last-child {
    margin-right: 0;
  }

  .cogs-icon {
    width: 100%;
    line-height: 20px;
    height: 20px;
    vertical-align: middle;
  }
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
