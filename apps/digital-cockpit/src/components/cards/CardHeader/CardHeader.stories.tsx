import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import CardHeader, { CardHeaderProps } from './CardHeader';

const meta: Meta<CardHeaderProps> = {
  title: 'Cards / Header',
  component: CardHeader,
  argTypes: {
    title: {
      name: 'Title',
      type: { name: 'string', required: true },
      defaultValue: 'My Card',
      description: 'Title of card',
      control: {
        type: 'text',
      },
    },
    subtitle: {
      name: 'Subtitle',
      type: { name: 'string', required: false },
      defaultValue: 'My Subtitle of Card',
      description: 'Subtitle of card',
      control: {
        type: 'text',
      },
    },
    icon: {
      name: 'Icon Type',
      type: { name: 'string', required: true },
      defaultValue: 'Grafana',
      description:
        'Icon of card. Either a Cogs icon or a special type (e.g. App.Charts, Resource.TimeSeries)',
      control: {
        type: 'text',
      },
    },
    appendIcon: {
      name: 'Appending Icon',
      type: { name: 'string', required: false },
      defaultValue: 'ChevronRight',
      description: 'Icon to append. Normally ChevronRight or ExternalLink',
      control: {
        type: 'text',
      },
    },

    onClick: {
      name: 'On Click',
      action: 'clicked',
      description: 'On click',
    },
  },
};

export default meta;

const Template: ExtendedStory<CardHeaderProps> = (args) => (
  <div>
    <CardHeader {...args} />
    <div style={{ width: 500 }}>
      <CardHeader {...args} />
    </div>
  </div>
);

export const StandardCard = Template.bind({});
StandardCard.args = {};
