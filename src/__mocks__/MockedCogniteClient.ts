import noop from 'lodash-es/noop';
import { CogniteEvent, InternalId } from '@cognite/sdk';
import { mockCogniteAssetList } from 'src/__test-utils/fixtures/assets';
import { mockFileList } from 'src/__test-utils/fixtures/files';

export const MOCK_PROJECT_NAME = 'test-project';

export class MockedCogniteClient {
  loginWithOAuth = noop;

  authenticate = noop;

  groups = {
    list: () => {
      return Promise.resolve([{ id: 1, name: 'test', isDeleted: false }]);
    },
  };

  labels = {
    list: () => {
      return Promise.resolve({
        items: [
          {
            externalId: 'test',
            name: 'testname',
          },
        ],
      });
    },
  };

  assets = {
    search: (body: {
      filter: {
        metadata: {
          type: string;
        };
      };
      search: {
        name: string;
      };
    }): Promise<never[]> =>
      new Promise((resolve, reject) => {
        if (body.filter) {
          reject(new Error('Filter not handled'));
        }
        resolve([]);
      }),
    list: (body: {
      filter: {
        metadata: {
          type: string;
        };
        parentIds: number[];
      };
    }): Promise<{ items: never[] }> =>
      new Promise((resolve, reject) => {
        if (body.filter) {
          reject(new Error('Filter not handled'));
        }
        resolve({ items: [] });
      }),
    retrieve: () => Promise.resolve(mockCogniteAssetList),
  };

  files = {
    retrieve: (fileIds: InternalId[]) =>
      Promise.resolve(
        mockFileList.filter((file) =>
          fileIds.map((internalId) => internalId.id).includes(file.id)
        )
      ),
  };

  events = {
    list: (body: {
      filter: {
        assetIds: number[];
      };
    }) => {
      return {
        autoPagingToArray: async (): Promise<CogniteEvent[]> =>
          body.filter.assetIds.map((assetId) => {
            return { assetIds: [assetId] } as CogniteEvent;
          }),
      };
    },
  };

  post = async (url: RequestInfo) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    function getJsonOrText(text: string) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    }

    const response = await fetch(url, requestOptions);
    const text = await response.text();
    const data = getJsonOrText(text);

    if (!response.ok) {
      if (data && data.error) {
        return Promise.reject(new Error({ ...data.error }));
      }

      if (data && data.Message) {
        data.message = data.Message;
      }

      const error = data
        ? { ...data, statusText: response.statusText }
        : response.statusText;
      return Promise.reject(error);
    }
    return data;
  };

  get = async (url: RequestInfo) => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    function getJsonOrText(text: string) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    }

    const response = await fetch(url, requestOptions);
    const text = await response.text();
    const data = getJsonOrText(text);

    if (!response.ok) {
      if (data && data.error) {
        return Promise.reject(new Error({ ...data.error }));
      }

      if (data && data.Message) {
        data.message = data.Message;
      }

      const error = data
        ? { ...data, statusText: response.statusText }
        : response.statusText;
      return Promise.reject(error);
    }

    return data;
  };

  getBaseUrl = () => 'test-url';
  project = MOCK_PROJECT_NAME;
}
