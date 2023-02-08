import { Label, Title } from '@cognite/cogs.js';
import { InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { Header } from './Common';

export const SmallNode = ({
  item,
}: {
  item: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode;
}) => {
  const isType = item.kind === 'ObjectTypeDefinition';
  return (
    <Header>
      <Title level={5} style={{ flex: 1 }}>
        {item.name.value}
      </Title>
      <Label variant={isType ? 'normal' : 'warning'} size="small">
        {isType ? 'Type' : 'Interface'}
      </Label>
    </Header>
  );
};
