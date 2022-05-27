import React from 'react';
import { CogniteAnnotation } from '@cognite/annotations';
import { action } from '@storybook/addon-actions';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { CogniteClient } from '@cognite/sdk';
import { files } from '../../../../stubs/files';
import { FilePreviewOverview } from './FilePreviewOverview';

export default {
  title: 'Files/FilePreviewOverview',
  component: FilePreviewOverview,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
  argTypes: { page: { control: 'number' }, defaultValue: 0 },
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

export const Example = args => <FilePreviewOverview {...args} />;
Example.args = {
  file: files[0],
  annotations: [],
  onPageChange: action('onPageChange'),
  onAssetClicked: action('onAssetClicked'),
  onFileClicked: action('onFileClicked'),
  onTimeseriesClicked: action('onTimeseriesClicked'),
  onEventClicked: action('onEventClicked'),
  onSequenceClicked: action('onSequenceClicked'),
};

export const ExampleWithAnnotations = args => <FilePreviewOverview {...args} />;
ExampleWithAnnotations.args = {
  annotations,
  file: files[0],
  onPageChange: action('onPageChange'),
  onAssetClicked: action('onAssetClicked'),
  onFileClicked: action('onFileClicked'),
  onTimeseriesClicked: action('onTimeseriesClicked'),
  onEventClicked: action('onEventClicked'),
  onSequenceClicked: action('onSequenceClicked'),
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const sdk = new CogniteClient({
    appId: 'invalid',
    project: 'test',
    getToken: () => Promise.resolve('token'),
  });
  return (
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
      {children}
    </CogniteFileViewer.Provider>
  );
};
