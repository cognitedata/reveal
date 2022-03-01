import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { action } from '@storybook/addon-actions';

import Card, { CardProps } from './Card';

const meta: Meta<CardProps> = {
  title: 'Cards / Main',
  component: Card,
  argTypes: {
    header: {
      defaultValue: {
        title: 'Title',
        subtitle: 'Subtitle',
        icon: 'Grafana',
      },
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<CardProps> = (args) => (
  <div>
    <div style={{ width: 256, marginBottom: 16 }}>
      <Card
        isMini
        header={{
          title: args.header.title,
          icon: args.header.icon,
          appendIcon: 'ChevronRight',
          onClick: action('onClick'),
        }}
      />
    </div>
    <div style={{ width: 256, marginBottom: 16 }}>
      <Card
        header={{
          title: args.header.title,
          icon: args.header.icon,
          appendIcon: 'ChevronRight',
          onClick: action('onClick'),
        }}
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <Card {...args} />
    </div>

    <div style={{ marginBottom: 16 }}>
      <Card {...args}>Normal size</Card>
    </div>

    <div style={{ width: 500, height: 500, marginBottom: 16 }}>
      <Card {...args}>SomeContent</Card>
    </div>

    <div style={{ width: 500, height: 300, marginBottom: 16 }}>
      <Card {...args}>SomeContent</Card>
    </div>
  </div>
);

export const StandardCard = Template.bind({});
StandardCard.args = {};
