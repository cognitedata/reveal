import { MouseEventHandler } from 'react';
import { Button, IconType } from '@cognite/cogs.js';
import { defaultTranslations } from 'components/NodeEditor/translations';

type Props = {
  isEditing: boolean;
  readOnly: boolean;
  disabled: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  translations: typeof defaultTranslations;
};
const EditSaveViewButton = ({
  isEditing,
  readOnly,
  disabled,
  onClick,
  translations: t,
}: Props) => {
  const buttonIconAndLabel = (): [IconType, string] => {
    if (readOnly && !isEditing) return ['EyeShow', t['See details']];
    if (isEditing) return ['Checkmark', t.Save];
    return ['Edit', t.Edit];
  };
  const [icon, label] = buttonIconAndLabel();
  return (
    <Button
      type="ghost"
      icon={icon}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export default EditSaveViewButton;
