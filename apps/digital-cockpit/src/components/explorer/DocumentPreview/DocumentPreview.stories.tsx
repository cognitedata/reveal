import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import exampleImage from 'images/applications/maintain_preview.jpg';
import { FileInfo } from '@cognite/sdk';
import { CdfClient } from 'utils';

import DocumentPreview, { DocumentPreviewProps } from '.';

const meta: Meta<DocumentPreviewProps> = {
  title: 'Document / Document Preview',
  component: DocumentPreview,
  argTypes: {
    document: {
      name: 'Document',
      defaultValue: {
        id: 1,
        name: 'File name.png',
      } as FileInfo,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<DocumentPreviewProps> = (args) => (
  <div>
    <div style={{ width: 100, height: 50 }}>
      <DocumentPreview {...args} />
    </div>
    <div style={{ width: 250, height: 200 }}>
      <DocumentPreview {...args} />
    </div>
  </div>
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
    return client;
  },
});
