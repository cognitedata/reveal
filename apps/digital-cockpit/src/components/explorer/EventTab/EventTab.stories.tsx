import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CdfClient } from 'utils';
import sinon from 'sinon';
import { MockEvents } from '__mocks/events';

import EventTab, { EventTabProps } from './EventTab';

const meta: Meta<EventTabProps> = {
  title: 'Events / Event Tab',
  component: EventTab,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      defaultValue: 1,
    },
  },
};

export default meta;

const mockSearch = () => {
  const stub = sinon.stub();
  stub.callsFake((args) => {
    if (args.search?.name) {
      return Promise.resolve(MockEvents.multiple(4));
    }
    return Promise.resolve(MockEvents.multiple(8));
  });
  return stub;
};

const Template: ExtendedStory<EventTabProps> = (args) => <EventTab {...args} />;

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.events.search = mockSearch();
    return client;
  },
});

export const Loading = Template.bind({});
Loading.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.events.search = () =>
      new Promise((res) => {
        setTimeout(res, 2000);
      });
    return client;
  },
});

export const NoData = Template.bind({});
NoData.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.events.search = () => Promise.resolve([]);
    return client;
  },
});
