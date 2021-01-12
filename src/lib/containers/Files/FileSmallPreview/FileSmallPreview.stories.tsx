import React from 'react';
import { DataExplorationProvider } from 'lib/context';
import { files } from 'lib/stubs/files';
import { sdkMock } from 'lib/docs/stub';
import { FileSmallPreview } from './FileSmallPreview';

export default {
  title: 'Files/FileSmallPreview',
  component: FileSmallPreview,
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
export const Example = () => <FileSmallPreview fileId={files[0].id} />;
