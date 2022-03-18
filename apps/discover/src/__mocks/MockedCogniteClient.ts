import noop from 'lodash/noop';
import {
  DISCOVER_FEATURE_TYPE_PREFIX,
  TEST_ERROR_MESSAGE,
} from 'services/geospatial/constants';

import {
  CogniteEvent,
  ExternalId,
  GeospatialCreateFeatureType,
  GeospatialFeature,
  GeospatialRecursiveDelete,
  IdEither,
} from '@cognite/sdk';

import { mockCogniteAssetList } from '__test-utils/fixtures/assets';
import {
  getMockFileLinkWithInternalId,
  getMockFileLinkWithExternalId,
} from '__test-utils/fixtures/document';
import { GEOMETRY, TEST_STRING } from '__test-utils/fixtures/geometry';
import {
  mockedSequencesResultFixture,
  mockedWellResultFixture,
  mockedWellboreResultFixture,
} from '__test-utils/fixtures/well';
import { Well } from 'modules/wellSearch/types';

const getMockFileLinkWithId = (id: IdEither) => {
  if ('id' in id) return getMockFileLinkWithInternalId(id);
  if ('externalId' in id) return getMockFileLinkWithExternalId(id);
  return false;
};

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

  files = {
    getDownloadUrls: (ids: IdEither[]) =>
      Promise.resolve(ids.map(getMockFileLinkWithId)),
    retrieve: (ids: IdEither[]) =>
      Promise.resolve(ids.map(getMockFileLinkWithId)),
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
    }): Promise<Partial<Well>[]> =>
      new Promise((resolve, reject) => {
        if (body.filter.metadata.type === 'well') {
          if (body.search.name === '!simulate throw error!') {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ message: 'Error' });
          }

          const wells = mockedWellResultFixture.filter((well) =>
            well.name.includes(body.search.name)
          );

          resolve([...wells]);
        }
      }),
    list: (body: {
      filter: {
        metadata: {
          type: string;
        };
        parentIds: number[];
      };
    }): Promise<{ items: any[] }> =>
      new Promise((resolve, reject) => {
        if (body.filter.metadata.type === 'wellbore') {
          const wellbores = mockedWellboreResultFixture.filter(
            (wellbore: any) => body.filter.parentIds.includes(wellbore.parentId)
          );
          resolve({ items: [...wellbores] });
        }
        reject();
      }),
    retrieve: () => Promise.resolve(mockCogniteAssetList),
  };

  sequences = {
    list: (body: {
      filter: {
        assetIds: number[];
      };
    }): Promise<{ items: any[] }> =>
      new Promise((resolve) => {
        const sequences = mockedSequencesResultFixture.filter((sequence: any) =>
          body.filter.assetIds.includes(sequence.parentId)
        );
        resolve({ items: [...sequences] });
      }),
    retrieveRows: () => {
      return { autoPagingToArray: async () => [] };
    },
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

  geospatial = {
    featureType: {
      create: (featureType: GeospatialCreateFeatureType[]) => {
        if (featureType[0]?.externalId === DISCOVER_FEATURE_TYPE_PREFIX) {
          return Promise.reject(new Error(TEST_ERROR_MESSAGE));
        }
        return Promise.resolve(featureType);
      },
      delete: (
        externalIds: ExternalId[],
        params?: GeospatialRecursiveDelete | undefined
      ) => {
        if (externalIds || params) return Promise.resolve({});

        return Promise.reject(TEST_ERROR_MESSAGE);
      },
    },
    feature: {
      create: (
        featureTypeExternalId: string,
        features: GeospatialFeature[]
      ) => {
        if (features.length && featureTypeExternalId) {
          return Promise.resolve(featureTypeExternalId);
        }
        return Promise.reject(new Error(TEST_ERROR_MESSAGE));
      },

      search: (externalId: string, filter: any) => {
        if (externalId && filter)
          return Promise.resolve([
            {
              geometry: GEOMETRY,
              Operator: TEST_STRING,
              createdTime: Date.now(),
              lastUpdatedTime: Date.now(),
              externalId: 'test',
            },
          ]);

        return Promise.reject(new Error());
      },
    },
  };
}
