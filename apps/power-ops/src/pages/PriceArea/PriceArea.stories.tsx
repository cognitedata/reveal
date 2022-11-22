import { Meta, Story } from '@storybook/react';
import { PriceArea } from 'pages/PriceArea/PriceArea';
import {
  authDecorator,
  reactQueryDecorator,
  reactRouterDecorator,
} from 'utils/test/storyDecorators';

export default {
  component: PriceArea,
  title: 'Pages/Price Area',
  decorators: [reactRouterDecorator(), authDecorator(), reactQueryDecorator],
} as Meta;

const Template: Story = () => <PriceArea />;

export const Default = Template.bind({});
