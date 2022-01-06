import { Body, Title } from '@cognite/cogs.js';
import {
  getFieldType,
  renderFieldType,
} from '@platypus-app/utils/graphql-utils';
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import styled from 'styled-components';
import { doesFieldHaveDirective, doesNodeHaveDirective } from '../utils';
import { Header, PropertyItem } from './Common';

export const FullNode = ({
  item,
  showRequiredIcon,
}: {
  item: ObjectTypeDefinitionNode;
  showRequiredIcon: boolean;
}) => {
  const hasRequiredFilter =
    showRequiredIcon && doesNodeHaveDirective(item, 'required');
  return (
    <>
      <Header>
        <Title level={5}>{item.name.value}</Title>
        <Body level={2}>[type]</Body>
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
            <Body level={2}>{renderFieldType(el.type)}</Body>
            {hasRequiredFilter && renderIconIfRequired(el)}
          </div>
        </PropertyItem>
      ))}
    </>
  );
};

const renderIconIfRequired = (item: FieldDefinitionNode) => {
  if (doesFieldHaveDirective(item, 'required')) {
    return <StyledRequired>R</StyledRequired>;
  }
  return <div style={{ width: 16 }} />;
};

const StyledRequired = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-weight: 600;
  color: var(--cogs-white);
  border-radius: 1px;
  background-color: var(--cogs-purple-4);
`;

const StyledMainID = styled.span`
  display: inline-block;
  padding: 0 0.1rem;
  color: var(--cogs-white);
  border-radius: 1px;
  background-color: var(--cogs-greyscale-grey7);
`;
