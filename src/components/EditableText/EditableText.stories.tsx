/**
 * EditableText StoryBook
 */

import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';
import EditableText from './EditableText';

type Props = React.ComponentProps<typeof EditableText>;

export default {
  component: EditableText,
  title: 'Components/Editable Text',
} as Meta;

const Template: Story<Props> = (args) => {
  return (
    <div
      style={{
        maxWidth: '15rem',
        border: '1px solid var(--cogs-border-default)',
        borderRadius: '4px',
        padding: '1rem',
      }}
    >
      <EditableText {...args} />
    </div>
  );
};

const ActionTemplate: Story<Props> = (args) => {
  const [localValue, setLocalValue] = useState(args.value);
  const [localArgs, setLocalArgs] = useState(args);
  const handleOnChange = (val: string) => {
    setLocalValue(val);
    setLocalArgs((obj) => ({
      ...obj,
      editing: false,
    }));
  };
  return (
    <div
      style={{
        maxWidth: '25rem',
        border: '1px solid var(--cogs-border-default)',
        borderRadius: '4px',
        padding: '1rem',
      }}
    >
      <EditableText
        {...localArgs}
        value={localValue}
        onChange={(val) => handleOnChange(val)}
      />
    </div>
  );
};

export const Default = Template.bind({});
export const Editing = ActionTemplate.bind({});
export const Focused = ActionTemplate.bind({});
export const ErrorState = ActionTemplate.bind({});
export const ButtonsVisible = ActionTemplate.bind({});
export const ButtonsHidden = ActionTemplate.bind({});

Default.args = {
  value: 'Text value',
  hideButtons: true,
  onChange: () => {},
};

Editing.args = {
  value: 'Text field value ...',
  editing: true,
};

Focused.args = {
  value: 'Text field value ...',
  editing: true,
  focus: true,
};

ErrorState.args = {
  value: 'Text value with error',
  isError: true,
};

ButtonsVisible.args = {
  value: 'Text field value ...',
  hideButtons: false,
};

ButtonsHidden.args = {
  value: 'Save text on blur or enter',
  hideButtons: true,
};
