import { assets } from 'lib/stubs/assets';
import { timeseries } from 'lib/stubs/timeseries';
import { sequences } from 'lib/stubs/sequences';
import { events } from 'lib/stubs/events';
import { files } from 'lib/stubs/files';
import styled from 'styled-components';
import { datapoints } from 'lib/stubs/timeseriesData';
import {
  ResourcePreviewObserver,
  ResourcePreviewProps,
  OpenSelectorProps,
  ResourceSelector,
} from '../context';

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
      const reponse = await fetch('//unsplash.it/300/400');
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
      return { data: { items: [{ name: 'david', id: 123 }] } };
    }
    if (query.includes('assets')) {
      if (body.data && body.data.filter && body.data.filter.dataSetIds) {
        return { data: { items: [assets[2]] } };
      }
      return { data: { items: assets } };
    }
    if (query.includes('files')) {
      return { data: { items: files } };
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
  datasets: {
    list: async () => ({ data: { items: [] } }),
  },
  groups: {
    list: async () => [
      {
        capabilities: [{ datasetsAcl: { actions: ['READ', 'WRITE'] } }],
      },
    ],
  },
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/300/300' }],
  },
  datapoints: {
    retrieve: async () => datapoints.items,
  },
};

export const Container = styled.div`
  padding: 20px;
  display: flex;
`;
