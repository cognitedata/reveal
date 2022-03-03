import { ComponentMeta, Story } from '@storybook/react';
import { defaultTranslations } from 'components/NodeEditor/translations';
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

NormalState.args = { translations: defaultTranslations };
EditingState.args = { isEditing: true, translations: defaultTranslations };
ReadonlyState.args = { readOnly: true, translations: defaultTranslations };
DisabledNormalState.args = {
  disabled: true,
  translations: defaultTranslations,
};
DisabledEditingState.args = {
  disabled: true,
  isEditing: true,
  translations: defaultTranslations,
};
DisabledReadonlyState.args = {
  disabled: true,
  readOnly: true,
  translations: defaultTranslations,
};

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
        translations={defaultTranslations}
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
        translations={defaultTranslations}
      />
    </>
  );
};
