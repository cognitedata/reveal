import * as React from 'react';
import { Story, ComponentMeta } from '@storybook/react';

import { FloatingActions } from '../FloatingActions';

export default {
  title: 'Map / Floating Actions',
  component: FloatingActions,
  argTypes: {
    onSearchClicked: { action: 'Clicked search' },
    onDeleteClicked: { action: 'Clicked remove' },
  },
} as ComponentMeta<typeof FloatingActions>;

const BaseComponent: Story<React.ComponentProps<typeof FloatingActions>> = (
  props
) => <FloatingActions {...props} />;

export const Actions = BaseComponent.bind({});
