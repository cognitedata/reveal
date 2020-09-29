import React from 'react';
import styled from 'styled-components';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { mockStore } from 'utils/mockStore';
import { Map } from 'immutable';
import { CogniteAnnotation } from '@cognite/annotations';
import { number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { getSDK } from 'utils/SDK';
import { FilePreviewOverview } from './FilePreviewOverview';

export default {
  title: 'Molecules/FilePreviewOverview',
  component: FilePreviewOverview,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

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
      items: Map([
        [1, { id: 1, name: 'Sample asset', description: 'Random string' }],
      ]),
    },
  },
  files: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { id: 1, name: 'Sample file', mimeType: 'png' }]]),
    },
  },
  sequences: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { id: 1, name: 'Sample sequence' }]]),
    },
  },
  events: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { id: 1, type: 'Sample event' }]]),
    },
  },
  timeseries: {
    items: {
      getById: { 1: { done: true } },
      items: Map([[1, { id: 1, name: 'Sample ts' }]]),
    },
  },
};

const filler = {
  version: 5,
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
  label: 'asset',
  status: 'unhandled',
  box: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
  source: 'email:david',
};
const annotations = [
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
    page: 2,
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
];

export const Example = () => (
  <FilePreviewOverview
    file={file}
    annotations={[]}
    page={number('page', 0)}
    onPageChange={action('onPageChange')}
    onAssetClicked={action('onAssetClicked')}
    onFileClicked={action('onFileClicked')}
    onTimeseriesClicked={action('onTimeseriesClicked')}
    onEventClicked={action('onEventClicked')}
    onSequenceClicked={action('onSequenceClicked')}
  />
);

export const ExampleWithAnnotations = () => (
  <FilePreviewOverview
    file={file}
    page={number('page', 0)}
    onPageChange={action('onPageChange')}
    onAssetClicked={action('onAssetClicked')}
    onFileClicked={action('onFileClicked')}
    onTimeseriesClicked={action('onTimeseriesClicked')}
    onEventClicked={action('onEventClicked')}
    onSequenceClicked={action('onSequenceClicked')}
    annotations={annotations}
  />
);

const sdk = getSDK();

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <CogniteResourceProvider store={mockStore(store)} sdk={sdk}>
        <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
          {children}
        </CogniteFileViewer.Provider>
      </CogniteResourceProvider>
    </Container>
  );
};

const Container = styled.div`
  width: 400px;
  padding: 40px;
  height: 800px;
  background: grey;
`;
