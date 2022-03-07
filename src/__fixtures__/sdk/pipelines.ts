import { ListResponse } from '@cognite/sdk';
import { DocumentsPipeline } from '@cognite/sdk-playground';
// eslint-disable-next-line jest/no-mocks-import
import { mockClassifierName } from 'src/__mocks__/sdk';

export const fixturePipelines = {
  list: () => {
    return {
      items: [
        {
          externalId: 'default',
          sensitivityMatcher: {
            matchLists: {
              contentList: ['smoke test sensitive words'],
              default_list_EN: [],
              default_list_NO: [],
            },
            fieldMappings: {
              sourceFile: {
                content: ['contentList'],
              },
            },
            sensitiveSecurityCategory: 1657873422246012,
            restrictToSources: ['unstructured-search-smoke-tests-sensitive'],
            filterPasswords: true,
          },
          classifier: {
            name: mockClassifierName,
            trainingLabels: [],
          },
        },
      ],
    } as ListResponse<DocumentsPipeline[]>;
  },
};
