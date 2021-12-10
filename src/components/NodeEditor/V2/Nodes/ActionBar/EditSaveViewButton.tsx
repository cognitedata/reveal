import { Button } from '@cognite/cogs.js';
import { MouseEventHandler } from 'react';

type Props = {
  isEditing: boolean;
  readOnly: boolean;
  disabled: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const EditSaveViewButton = ({
  isEditing,
  readOnly,
  disabled,
  onClick,
}: Props) => {
  const buttonIconAndLabel = (): [string, string] => {
    if (readOnly && !isEditing) return ['EyeShow', 'See Details'];
    if (isEditing) return ['Checkmark', 'Save'];
    return ['Edit', 'Edit'];
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
