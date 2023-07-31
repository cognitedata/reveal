import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CogniteEvent } from '@cognite/sdk';

import EventRow, { EventRowProps } from './EventRow';
import EventRowHeader from './EventRowHeader';
import { TableWrapper } from './TableWrapper';

const meta: Meta<EventRowProps> = {
  title: 'Events / Row',
  component: EventRow,
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
      } as CogniteEvent,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<EventRowProps> = (args) => (
  <TableWrapper>
    <EventRowHeader />
    <EventRow {...args} />
    <EventRow {...args} />
    <EventRow {...args} />
    <EventRow {...args} />
  </TableWrapper>
);

export const NormalRow = Template.bind({});
NormalRow.story = configureStory({});
