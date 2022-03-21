/**
 * StatusIcon StoryBook
 */

import { CalculationStatusStatusEnum } from '@cognite/calculation-backend';
import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { StatusIcon } from './StatusIcon';

export default {
  component: StatusIcon,
  title: 'Components/Status Icons',
} as Meta;

const Template: Story<ComponentProps<typeof StatusIcon>> = (args) => (
  <StatusIcon {...args} />
);

export const RunningStatusIcons = Template.bind({});
export const PendingStatusIcons = Template.bind({});
export const SuccessStatusIcons = Template.bind({});
export const FailedStatusIcons = Template.bind({});
export const ErrorStatusIcons = Template.bind({});
export const CancelledStatusIcons = Template.bind({});
export const UnknownStatusIcons = Template.bind({});

RunningStatusIcons.args = { status: CalculationStatusStatusEnum.Running };
PendingStatusIcons.args = { status: CalculationStatusStatusEnum.Pending };
SuccessStatusIcons.args = { status: CalculationStatusStatusEnum.Success };
FailedStatusIcons.args = { status: CalculationStatusStatusEnum.Failed };
ErrorStatusIcons.args = { status: CalculationStatusStatusEnum.Error };
CancelledStatusIcons.args = { status: CalculationStatusStatusEnum.Cancelled };
UnknownStatusIcons.args = { status: CalculationStatusStatusEnum.Unknown };
