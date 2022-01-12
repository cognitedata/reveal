import { Label, Title } from '@cognite/cogs.js';
import { ObjectTypeDefinitionNode } from 'graphql';
import { isTypeATemplate } from '../utils';
import { Header } from './Common';

export const SmallNode = ({ item }: { item: ObjectTypeDefinitionNode }) => (
  <Header>
    <Title level={5} style={{ flex: 1 }}>
      {item.name.value}
    </Title>
    <Label variant={isTypeATemplate(item) ? 'normal' : 'unknown'} size="small">
      {isTypeATemplate(item) ? 'Template' : 'Type'}
    </Label>
  </Header>
);
