import { LabelDefinition, ListResponse } from '@cognite/sdk';

export const fixtureLabels = {
  list: () => {
    return {
      items: [
        { name: 'test_label', externalId: 'test', createdTime: new Date() },
        { name: undefined, externalId: 'unknown', createdTime: new Date() },
      ],
    } as ListResponse<LabelDefinition[]>;
  },
};
