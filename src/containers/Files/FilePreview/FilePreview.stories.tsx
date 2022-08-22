import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { response } from './resources';
import { FilePreview } from './FilePreview';
// @ts-ignore
import pdfFileUrl from './pnid.pdf';

const pdfFile = {
  id: 111,
  externalId: 'PH-ME-P-0153-001.pdf',
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: 'Random File',
  mimeType: 'application/pdf',
};

const pdfSdkMock = {
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      return { data: { items: [pdfFile] } };
    }
    if (query.includes('events')) {
      return { data: { items: response } };
    }
    return { data: { items: [] } };
  },
  files: {
    retrieve: async () => [pdfFile],
    getDownloadUrls: async () => [
      {
        downloadUrl: pdfFileUrl,
      },
    ],
  },
} as unknown as CogniteClient;

export default {
  title: 'Files/FilePreview',
  component: FilePreview,
  parameters: {
    explorerConfig: { sdkMockOverride: pdfSdkMock },
  },
};

export const Example: ComponentStory<typeof FilePreview> = args => (
  <FilePreview {...args} />
);
Example.args = {
  fileId: pdfFile.id,
};
