/**
 * ShowHideButton StoryBook
 */

import { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { ShowHideButton, ShowHideButtonProps } from './ShowHideButton';

export default {
  component: ShowHideButton,
  title: 'Components/ShowHide Button',
} as Meta;

export const ShowHideBtnStateful: Story<ShowHideButtonProps> = () => {
  const [enabled, setEnabled] = useState(true);

  const handleClick = () => {
    setEnabled(!enabled);
  };

  return <ShowHideButton enabled={enabled} onClick={handleClick} />;
};

const Template: Story<ShowHideButtonProps> = (args) => (
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
