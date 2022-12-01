/**
 * Style Button Storybook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { StyleButton } from './StyleButton';

export default {
  component: StyleButton,
  title: 'Components/Style Button',
} as Meta;

const Template: Story<ComponentProps<typeof StyleButton>> = (args) => (
  <StyleButton {...args} />
);

export const TimeseriesStyleButton = Template.bind({});
export const WorkflowStyleButton = Template.bind({});
export const StyleButtonNoIcon = Template.bind({});

TimeseriesStyleButton.args = {
  icon: 'Timeseries',
  styleColor: '#6929c4',
  label: 'Timeseries',
};

WorkflowStyleButton.args = {
  icon: 'Function',
  styleColor: '#005d5d',
  label: 'Workflow Function',
};

StyleButtonNoIcon.args = {
  styleColor: '#8a3800',
  label: 'Color Button',
  size: 'small',
};
