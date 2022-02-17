import * as React from 'react';

import { SwitchBoolean } from './SwitchBoolean';
import { SwitchBooleanEnabled } from './SwitchBooleanEnabled';

export interface Props {
  name: string;
  handleChange: (value: boolean) => void;
  value: boolean;
  label: string;
  helpText?: string;
}
export const Switch: React.FC<Props> = ({
  name,
  handleChange,
  value,
  label,
  helpText,
}) => {
  // in the special case of this value
  // we want to invert the display value
  // so it makes more sense for the user
  if (label.toLowerCase() === 'disabled') {
    return (
      <SwitchBooleanEnabled
        name={name}
        handleChange={handleChange}
        value={value}
        helpText={helpText}
      />
    );
  }

  return (
    <SwitchBoolean
      name={name}
      handleChange={handleChange}
      value={value}
      label={label}
      helpText={helpText}
    />
  );
};
