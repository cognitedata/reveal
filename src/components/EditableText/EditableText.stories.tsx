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
        maxWidth: '25rem',
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
  const [value, setValue] = useState('Text here...');
  const onChange = (val: string) => {
    setValue(val);
  };
  return (
    <div
      style={{
        maxWidth: '15rem',
        border: '1px solid var(--cogs-border-default)',
        borderRadius: '4px',
        padding: '1rem',
      }}
    >
      <EditableText {...args} value={value} onChange={(val) => onChange(val)} />
    </div>
  );
};

export const EditableTexts = ActionTemplate.bind({});
export const EditableTextWithButtons = Template.bind({});
export const EditableTextIsEditing = Template.bind({});
export const EditableTextWithError = Template.bind({});

EditableTexts.args = {
  hideButtons: true,
};

EditableTextWithButtons.args = {
  value: 'Text field value ...',
  hideButtons: false,
};

EditableTextIsEditing.args = {
  value: 'Text field value ...',
  editing: true,
};

EditableTextWithError.args = {
  value: 'Text value with error',
  isError: true,
};
