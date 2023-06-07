/**
 * StatusIcon StoryBook
 */

import { StatusStatusEnum } from '@cognite/calculation-backend';
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

RunningStatusIcons.args = { status: StatusStatusEnum.Running };
PendingStatusIcons.args = { status: StatusStatusEnum.Pending };
SuccessStatusIcons.args = { status: StatusStatusEnum.Success };
FailedStatusIcons.args = { status: StatusStatusEnum.Failed };
ErrorStatusIcons.args = { status: StatusStatusEnum.Error };
CancelledStatusIcons.args = { status: StatusStatusEnum.Cancelled };
UnknownStatusIcons.args = { status: StatusStatusEnum.Unknown };
