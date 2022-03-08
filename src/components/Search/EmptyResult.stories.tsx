import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import EmptyResult from './EmptyResult';

export default {
  component: EmptyResult,
  title: 'Components/Empty Result',
} as Meta;

const Template: Story<ComponentProps<typeof EmptyResult>> = (args) => (
  <EmptyResult {...args} />
);

export const DefaultEmptyResult = Template.bind({});

DefaultEmptyResult.args = {};
