import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { ViewMoreButton } from 'components/ViewMoreButton/ViewMoreButton';
import { reactRouterDecorator } from 'utils/test/storyDecorators';

export default {
  component: ViewMoreButton,
  title: 'Components/View More Button',
  decorators: [reactRouterDecorator()],
} as Meta;

const Template: Story<ComponentProps<typeof ViewMoreButton>> = (args) => (
  <ViewMoreButton {...args} />
);

export const Default = Template.bind({});

Default.args = {};
