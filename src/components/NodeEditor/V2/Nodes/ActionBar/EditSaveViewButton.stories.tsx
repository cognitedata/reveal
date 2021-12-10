import { ComponentMeta, Story } from '@storybook/react';
import { ComponentProps, useState } from 'react';
import EditSaveViewButton from './EditSaveViewButton';

export default {
  component: EditSaveViewButton,
  title: 'Components/Node Editor/v2/Nodes/Edit-Save-View Button',
} as ComponentMeta<typeof EditSaveViewButton>;

const Template: Story<ComponentProps<typeof EditSaveViewButton>> = (args) => (
  <EditSaveViewButton {...args} />
);

export const NormalState = Template.bind({});
export const EditingState = Template.bind({});
export const ReadonlyState = Template.bind({});
export const DisabledNormalState = Template.bind({});
export const DisabledEditingState = Template.bind({});
export const DisabledReadonlyState = Template.bind({});

EditingState.args = { isEditing: true };
ReadonlyState.args = { readOnly: true };
DisabledNormalState.args = { disabled: true };
DisabledEditingState.args = { disabled: true, isEditing: true };
DisabledReadonlyState.args = { disabled: true, readOnly: true };

export const EditablePlayground = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <p>Click the button</p>
      <EditSaveViewButton
        isEditing={isEditing}
        readOnly={false}
        disabled={false}
        onClick={() => setIsEditing(!isEditing)}
      />
    </>
  );
};

export const ReadonlyPlayground = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <p>Click the button</p>
      <EditSaveViewButton
        isEditing={isEditing}
        readOnly
        disabled={false}
        onClick={() => setIsEditing(!isEditing)}
      />
    </>
  );
};
