/**
 * ShowHideButton StoryBook
 */

import { ComponentProps, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { ShowHideButton } from './ShowHideButton';

export default {
  component: ShowHideButton,
  title: 'Components/ShowHide Button',
} as Meta;

export const ShowHideBtnStateful: Story<
  ComponentProps<typeof ShowHideButton>
> = () => {
  const [enabled, setEnabled] = useState(true);

  const handleClick = () => {
    setEnabled(!enabled);
  };

  return <ShowHideButton enabled={enabled} onClick={handleClick} />;
};

const Template: Story<ComponentProps<typeof ShowHideButton>> = (args) => (
  <ShowHideButton {...args} />
);

export const ShowHideBtnEnabled = Template.bind({});
export const ShowHideBtnDisabled = Template.bind({});

ShowHideBtnEnabled.args = {
  onClick: () => {},
  enabled: true,
};

ShowHideBtnDisabled.args = {
  onClick: () => {},
  enabled: false,
};
