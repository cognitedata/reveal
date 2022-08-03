import { ComponentStory } from '@storybook/react';
import React from 'react';

import { RelationshipTable } from './RelationshipTable';

export default {
  title: 'Relationship/RelationshipTable',
  component: RelationshipTable,
};
export const Example: ComponentStory<typeof RelationshipTable> = args => (
  <RelationshipTable {...args} />
);
Example.args = {
  type: 'asset',
  parentResource: {
    id: 354247832298988,
    type: 'asset',
    externalId: 'LOR_SWEDEN',
  },
};
