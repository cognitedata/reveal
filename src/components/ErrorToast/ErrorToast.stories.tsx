/**
 * Error Toast StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { toast, Button, ToastContainer } from '@cognite/cogs.js';
import ErrorToast from './ErrorToast';

type Props = React.ComponentProps<typeof ErrorToast>;

export default {
  component: ErrorToast,
  title: 'Components/Error Toast',
} as Meta;

const Template: Story<Props> = (args) => (
  <>
    <ToastContainer />
    <Button
      onClick={() => {
        toast.error(<ErrorToast {...args} />);
      }}
    >
      Error Toast
    </Button>
  </>
);

export const ErrorToasts = Template.bind({});

ErrorToasts.args = {
  title: 'Error Toast',
  text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit.',
};
