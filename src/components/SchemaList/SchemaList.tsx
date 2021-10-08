import { Body, Button, Dropdown, Menu, Title } from '@cognite/cogs.js';
import { parse } from 'graphql';
import { useMemo } from 'react';
import styled from 'styled-components';
import { getObjectTypes, getUnionTypes } from '../../utils/graphql-utils';

const AddNewDropdownContent = () => (
  <Menu>
    <Menu.Item>Schema Type</Menu.Item>
    <Menu.Item>Union</Menu.Item>
  </Menu>
);

export const SchemaList = ({
  graphQLSchemaString,
}: {
  graphQLSchemaString: string;
}) => {
  const schemaTypes = useMemo(
    () => parse(graphQLSchemaString as string).definitions,
    [graphQLSchemaString]
  );

  const objectTypes = useMemo(() => getObjectTypes(schemaTypes), [schemaTypes]);
  const unionTypes = useMemo(() => getUnionTypes(schemaTypes), [schemaTypes]);

  return (
    <>
      <Header>
        <Title level={4} style={{ flex: 1 }}>
          Schema Types
        </Title>
        <Dropdown content={AddNewDropdownContent}>
          <Button icon="Down" iconPlacement="right" variant="outline">
            Add New
          </Button>
        </Dropdown>
      </Header>
      {objectTypes.map((el) => (
        <ListItem key={el.name.value}>
          <Body level={2} style={{ flex: 1 }}>
            {el.name.value}
          </Body>
          <Button variant="ghost" icon="VerticalEllipsis" />
          <Button variant="ghost" icon="ArrowRight" />
        </ListItem>
      ))}

      <Header style={{ marginTop: 12 }}>
        <Title level={4} style={{ flex: 1 }}>
          Union types
        </Title>
      </Header>
      {unionTypes.map((el) => (
        <ListItem key={el.name.value}>
          <Body level={2} style={{ flex: 1 }}>
            {el.name.value}
          </Body>
          <Button variant="ghost" icon="VerticalEllipsis" />
          <Button variant="ghost" icon="ArrowRight" />
        </ListItem>
      ))}
    </>
  );
};

const Header = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const ListItem = styled.div`
  padding-top: 4px;
  padding-bottom: 4px;
  display: flex;
  align-items: center;
`;
