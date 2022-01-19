/**
 * Style Button Storybook
 */

import { Meta, Story } from '@storybook/react';
import { StyleButton, StyleButtonProps } from './StyleButton';

export default {
  component: StyleButton,
  title: 'Components/Style Button',
} as Meta;

const Template: Story<StyleButtonProps> = (args) => <StyleButton {...args} />;

export const TimeseriesStyleButton = Template.bind({});
export const WorkflowStyleButton = Template.bind({});

TimeseriesStyleButton.args = {
  styleType: 'Timeseries',
  styleColor: '#6929c4',
  label: 'Timeseries',
};
WorkflowStyleButton.args = {
  styleType: 'Function',
  styleColor: '#005d5d',
  label: 'Workflow Function',
};
