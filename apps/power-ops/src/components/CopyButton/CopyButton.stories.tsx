import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { CopyButton } from 'components/CopyButton/CopyButton';
import { boxDecorator } from 'utils/test/storyDecorators';

const box = boxDecorator({
  height: 80,
  width: 65,
  paddingTop: 35,
  paddingLeft: 15,
});

export default {
  component: CopyButton,
  title: 'Components/Copy Button',
  argTypes: { onClick: { action: 'Clicked' } },
  parameters: {
    layout: 'centered',
  },
} as Meta;

const Template: Story<ComponentProps<typeof CopyButton>> = (args) => (
  <CopyButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
  className: 'test-123',
};

export const CopySuccess = Template.bind({});
CopySuccess.args = {
  onClick: async () => true,
};
CopySuccess.decorators = [box];
CopySuccess.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const copyButton = canvas.getByLabelText('Copy text');
  userEvent.click(copyButton);
};

export const CopyFailure = Template.bind({});
CopyFailure.decorators = [box];
CopyFailure.args = {
  onClick: async () => false,
};
CopyFailure.play = CopySuccess.play;
