import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CogniteEvent } from '@cognite/sdk';

import EventSidebar, { EventSidebarProps } from './EventSidebar';

const meta: Meta<EventSidebarProps> = {
  title: 'Events / Sidebar',
  component: EventSidebar,
  argTypes: {
    event: {
      name: 'Event',
      defaultValue: {
        id: 1,
        description: 'Event Description',
        type: 'Type',
        subtype: 'Subtype',
        startTime: new Date(),
        endTime: new Date(),
        metadata: { model_id: '12432353' },
      } as unknown as CogniteEvent,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<EventSidebarProps> = (args) => (
  <EventSidebar {...args} />
);

export const Sidebar = Template.bind({});
Sidebar.story = configureStory({});
