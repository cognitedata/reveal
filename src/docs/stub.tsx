import { assets, rootAssets } from 'stubs/assets';
import { timeseries } from 'stubs/timeseries';
import { sequences } from 'stubs/sequences';
import { datasets } from 'stubs/datasets';
import { events } from 'stubs/events';
import { files } from 'stubs/files';
import styled from 'styled-components';
import { datapoints } from 'stubs/timeseriesDatapoints';
import { AssetListScope, IdEither } from '@cognite/sdk';
import { relationships } from 'stubs/relationships';
import {
  ResourcePreviewObserver,
  ResourcePreviewProps,
  OpenSelectorProps,
  ResourceSelector,
} from '../context';

const UNSPLASH_URL = 'https://unsplash.it/300/400';

export const ResourcePreviewContextFunctions = (_: ResourcePreviewObserver) =>
  null;
export const ResourcePreviewPropsFunctions = (_: ResourcePreviewProps) => null;

export const ResourceSelectorContextFunctions = (_: ResourceSelector) => null;

export const ResourceSelectorPropsFunctions: React.FC<OpenSelectorProps> = (
  _: OpenSelectorProps
) => null;

export const sdkMock = {
  get: async (query: string) => {
    if (query.includes('icon')) {
      const reponse = await fetch(UNSPLASH_URL);
      const arrayBuffer = await reponse.arrayBuffer();
      return arrayBuffer;
    }

    return { data: { items: [] } };
  },
  post: async (query: string, body: any) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }

    if (query.includes('datasets')) {
      if (query.includes('byids')) {
        const idArr = body.data.items.map((el: { id: IdEither }) => el.id);
        return {
          data: { items: datasets.filter(el => idArr.includes(el.id)) },
        };
      }

      return { data: { items: datasets } };
    }

    if (query.includes('assets')) {
      if (body.data && body.data.filter && body.data.filter.dataSetIds) {
        return { data: { items: [assets[2]] } };
      }

      if (body.data && body.data.filter && body.data.filter.root) {
        return { data: { items: rootAssets } };
      }

      if (query.includes('byids')) {
        const allAssets = [...rootAssets, ...assets];
        const idArr = body.data.items.map((el: { id: IdEither }) => el.id);
        const externalIdArr = body.data.items.map(
          (el: { externalId: IdEither }) => el.externalId
        );

        return {
          // Filter assets according to the ids.
          data: {
            items: allAssets.filter(
              el =>
                idArr.includes(el.id) || externalIdArr.includes(el.externalId)
            ),
          },
        };
      }

      return { data: { items: assets } };
    }
    if (query.includes('files')) {
      return { data: { items: files } };
    }
    if (query.includes('relationships')) {
      const { filter } = body.data;
      const filteredRelationship = relationships.filter(relationship =>
        filter.sourceExternalIds
          ? relationship.sourceExternalId === filter.sourceExternalIds[0]
          : relationship.targetExternalId === filter.targetExternalIds[0]
      );
      const labelsWithExternalId = filter?.labels?.containsAny;
      if (labelsWithExternalId) {
        const labels = new Set<string>(
          labelsWithExternalId.map((label: any) => label.externalId)
        );

        return {
          data: {
            items: filteredRelationship.filter(relationship =>
              relationship.labels?.some(label => labels.has(label.externalId))
            ),
          },
        };
      }

      return { data: { items: filteredRelationship } };
    }
    if (query.includes('timeseries')) {
      return { data: { items: timeseries } };
    }
    if (query.includes('sequences')) {
      return { data: { items: sequences } };
    }
    if (query.includes('events')) {
      return { data: { items: events } };
    }
    return { data: { items: [] } };
  },
  assets: {
    retrieve: async () => {
      return { items: rootAssets };
    },
    list: async (params?: AssetListScope) => {
      const { filter: { parentIds, root } = {} } = params as AssetListScope;
      if (root) {
        return { items: rootAssets };
      }
      if (parentIds) {
        return {
          items: assets.filter(asset => asset.parentId === parentIds[0]),
        };
      }
      return { items: assets };
    },
  },
  datasets: {
    list: async () => ({ data: { items: [] } }),
  },
  groups: {
    list: async () => {
      return [
        {
          capabilities: [
            {
              datasetsAcl: {
                actions: ['READ', 'WRITE'],
              },
            },
          ],
        },
        {
          capabilities: [
            {
              relationshipsAcl: { actions: ['READ', 'WRITE'] },
            },
          ],
        },
      ];
    },
  },
  files: {
    getDownloadUrls: async () => [{ downloadUrl: UNSPLASH_URL }],
  },
  datapoints: {
    retrieve: async (asc: any) => {
      const result = timeseries.find(asset => asset.id === asc.items[0].id);

      return datapoints.filter(
        datapoint => datapoint.externalId === result?.externalId
      );
    },
  },
};

export const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100%;
`;
