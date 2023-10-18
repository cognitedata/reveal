import { DataModelTypeDefsType } from '@fusion/data-modeling';

import { Chip, Title } from '@cognite/cogs.js';

import { Header } from './Common';

export const SmallNode = ({ item }: { item: DataModelTypeDefsType }) => {
  return (
    <Header>
      <Title level={5} style={{ flex: 1 }}>
        {item.name}
      </Title>
      <Chip
        label={item.kind === 'type' ? 'Type' : 'Interface'}
        type={item.kind === 'type' ? 'default' : 'warning'}
        size="small"
      />
    </Header>
  );
};
