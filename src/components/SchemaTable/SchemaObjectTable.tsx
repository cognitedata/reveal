import { Button, Dropdown, Flex, Title } from '@cognite/cogs.js';
import { ObjectTypeDefinitionNode } from 'graphql';

export const SchemaObjectTable = ({
  node,
}: {
  node: ObjectTypeDefinitionNode;
}) => (
  <Flex gap={12} alignItems="center">
    <Button icon="ArrowBack" variant="outline" shape="round" />
    <Title level={3}>{node.name.value}</Title>
    <div style={{ flex: 1 }} />
    <Dropdown>
      <Button variant="outline" icon="Down" iconPlacement="right">
        Add New
      </Button>
    </Dropdown>
    <Button icon="VerticalEllipsis" variant="ghost" />
  </Flex>
);
