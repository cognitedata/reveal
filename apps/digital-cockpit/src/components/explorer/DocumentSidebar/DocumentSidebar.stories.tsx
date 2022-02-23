import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { FileInfo } from '@cognite/sdk';
import exampleImage from 'images/applications/maintain_preview.jpg';
import { CdfClient } from 'utils/cdfClient';

import DocumentSidebar, { DocumentSidebarProps } from '.';

const meta: Meta<DocumentSidebarProps> = {
  title: 'Document / Sidebar',
  component: DocumentSidebar,
  argTypes: {
    document: {
      name: 'Document',
      defaultValue: {
        id: 1,
        name: 'IMG_20211129_104035.jpg',
        metadata: {
          'document:title': 'Document Title',
          'document:subtitle': 'Document subtitle',
        },
      } as unknown as FileInfo,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<DocumentSidebarProps> = (args) => (
  <DocumentSidebar {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.get = () => {
      return Promise.resolve({
        data: exampleImage,
        status: 200,
        headers: {},
      } as any);
    };

    client.cogniteClient.files.getDownloadUrls = () => {
      return Promise.resolve([
        {
          id: 1,
          downloadUrl: 'https://picsum.photos/500/300',
        },
      ]);
    };
    return client;
  },
});
