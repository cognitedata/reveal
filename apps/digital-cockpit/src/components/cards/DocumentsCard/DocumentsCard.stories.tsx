/* eslint-disable no-promise-executor-return */
import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { MockFiles } from '__mocks/files';
import { CdfClient } from 'utils';
import sinon from 'sinon';

import DocumentsCard, { DocumentsCardProps } from './DocumentsCard';

const meta: Meta<DocumentsCardProps> = {
  title: 'Cards / Documents Card',
  component: DocumentsCard,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      defaultValue: 1,
    },
    onFileClick: {
      name: 'On File Click',
      type: { name: 'action', required: false },
      description: 'On file click',
      control: {
        type: 'action',
      },
    },
    onHeaderClick: {
      name: 'On Header Click',
      type: { name: 'action', required: false },
      description: 'On header click',
      control: {
        type: 'action',
      },
    },
  },
};

export default meta;

const mockList = () => {
  const stub = sinon.stub();
  stub.callsFake(() => {
    return Promise.resolve({ items: MockFiles.multiple(5) });
  });
  return stub;
};

const Template: ExtendedStory<DocumentsCardProps> = (args) => (
  <DocumentsCard {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.files.list = mockList();
    return client;
  },
});
