import React from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { mockStore } from 'utils/mockStore';
import { Map } from 'immutable';
import { CogniteAnnotation } from '@cognite/annotations';
import { FilePreviewOverview } from './FilePreviewOverview';

export default { title: 'Molecules|FilePreviewOverview' };

const file = {
  id: 1,
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: 'Random File',
  mimeType: 'png',
  metadata: {
    RANDOM: 'yes',
    RANDOM2: 'yes',
    RANDOM3: 'yes',
    RANDOM4: 'yes',
    RANDOM5: 'lorem ipsum asd asdf ds dsaf  sf as',
  },
};

const store = {
  assets: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { name: 'Sample asset', description: 'Random string' }]]),
    },
  },
  files: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { name: 'Sample file', mimeType: 'png' }]]),
    },
  },
  sequences: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { name: 'Sample sequence' }]]),
    },
  },
  events: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { type: 'Sample event' }]]),
    },
  },
  timeseries: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { name: 'Sample ts' }]]),
    },
  },
};

export const Example = () => (
  // @ts-ignore
  <Provider store={mockStore(store)}>
    <Wrapper>
      <FilePreviewOverview
        file={file}
        annotations={[]}
        onPageChange={() => {}}
      />
    </Wrapper>
  </Provider>
);

const filler = {
  version: 5,
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
  label: 'asset',
  status: 'unhandled',
  box: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
  source: 'email:david',
};
export const ExampleWithAnnotations = () => (
  // @ts-ignore
  <Provider store={mockStore(store)}>
    <Wrapper>
      <FilePreviewOverview
        file={file}
        page={0}
        annotations={[
          {
            id: 1,
            resourceId: 1,
            resourceType: 'asset',
            page: 1,
            ...filler,
          } as CogniteAnnotation,
          {
            id: 6,
            resourceId: 1,
            resourceType: 'asset',
            page: 0,
            ...filler,
          } as CogniteAnnotation,
          {
            id: 2,
            resourceId: 1,
            resourceType: 'timeSeries',
            ...filler,
          } as CogniteAnnotation,
          {
            id: 3,
            resourceId: 1,
            resourceType: 'file',
            ...filler,
          } as CogniteAnnotation,
          {
            id: 4,
            resourceId: 1,
            resourceType: 'event',
            ...filler,
          } as CogniteAnnotation,
          {
            id: 5,
            resourceId: 1,
            resourceType: 'sequence',
            ...filler,
          } as CogniteAnnotation,
        ]}
        onPageChange={() => {}}
      />
    </Wrapper>
  </Provider>
);

const Wrapper = styled.div`
  width: 400px;
  padding: 40px;
  height: 800px;
  background: grey;
`;
