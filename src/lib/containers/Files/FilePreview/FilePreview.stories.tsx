import React from 'react';
import { DataExplorationProvider } from 'lib/context';
import { boolean } from '@storybook/addon-knobs';
import { files } from 'stubs/files';
import { sdkMock } from 'lib/docs/stub';
import { FilePreview } from './FilePreview';

export default {
  title: 'Files/FilePreview',
  component: FilePreview,
  decorators: [
    (storyFn: any) => (
      <DataExplorationProvider sdk={tempSdk}>
        {storyFn()}
      </DataExplorationProvider>
    ),
  ],
};

const tempSdk = {
  ...sdkMock,
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      return { data: { items: [files[0]] } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => (
  <FilePreview
    fileId={1}
    contextualization={boolean('contextualization', false)}
  />
);
