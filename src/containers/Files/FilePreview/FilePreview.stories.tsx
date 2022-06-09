import { ComponentStory } from '@storybook/react';
import React from 'react';
import { files } from 'stubs/files';
import { FilePreview } from './FilePreview';

const sdkMock = {
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

export default {
  title: 'Files/FilePreview',
  component: FilePreview,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};

export const Example: ComponentStory<typeof FilePreview> = args => (
  <FilePreview {...args} />
);
Example.args = {
  fileId: files[0].id,
};
