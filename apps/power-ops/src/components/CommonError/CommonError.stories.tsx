import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { CommonError } from 'components/CommonError/CommonError';

export default {
  component: CommonError,
  title: 'Components/Common Error',
  argTypes: { onButtonClick: { action: 'Clicked on Button' } },
} as Meta;

const Template: Story<ComponentProps<typeof CommonError>> = (args) => (
  <CommonError {...args}>Message</CommonError>
);

export const Default = Template.bind({});

Default.args = {
  title: 'Error',
};

export const Interactions = Template.bind({});

Interactions.args = {
  title: 'Title',
  buttonText: 'Reload',
};

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  const downloadButton = canvas.getByTestId('common-error-button');
  await userEvent.click(downloadButton);
  expect(args.onButtonClick).toBeCalled();
};
