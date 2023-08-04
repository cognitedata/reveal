import * as React from 'react';

import { Meta, StoryFn } from '@storybook/react';

import { FlowDemo } from './FlowDemo';

export default {
  component: FlowDemo,
} as Meta<typeof FlowDemo>;

export const Default: StoryFn<typeof FlowDemo> = (_args) => <FlowDemo />;

Default.args = {};
