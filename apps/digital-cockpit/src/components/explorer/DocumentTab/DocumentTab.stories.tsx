/* eslint-disable no-promise-executor-return */
import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { MockFiles } from '__mocks/files';
import { CdfClient } from 'utils';
import sinon from 'sinon';

import DocumentTab, { DocumentTabProps } from './DocumentTab';

const meta: Meta<DocumentTabProps> = {
  title: 'Document / Document Tab',
  component: DocumentTab,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      defaultValue: 1,
    },
    groupedByField: {
      name: 'Group by field',
      defaultValue: '',
    },
  },
};

export default meta;

const mockSearch = () => {
  const stub = sinon.stub();
  stub.callsFake((args) => {
    if (args.search?.name) {
      return Promise.resolve(MockFiles.multiple(4));
    }
    return Promise.resolve(MockFiles.multiple(8));
  });
  return stub;
};

const mockGet = () => {
  return Promise.resolve({
    data: '',
    status: 200,
    headers: {},
  } as any);
};

const Template: ExtendedStory<DocumentTabProps> = (args) => (
  <DocumentTab {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.get = mockGet;
    client.cogniteClient.files.search = mockSearch();
    return client;
  },
});

export const Grouped = Template.bind({});
Grouped.args = {
  groupByField: 'documentType',
};
Grouped.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.files.search = mockSearch();
    client.cogniteClient.get = mockGet;
    return client;
  },
});

export const Loading = Template.bind({});
Loading.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.get = mockGet;
    client.cogniteClient.files.search = () =>
      new Promise((res) => setTimeout(res, 2000));
    return client;
  },
});

export const NoData = Template.bind({});
NoData.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.get = mockGet;
    client.cogniteClient.files.search = () => Promise.resolve([]);
    return client;
  },
});
