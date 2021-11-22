import * as React from 'react';

import { Switch } from '@cognite/cogs.js';

export interface Props {
  name: string;
  handleChange: (value: boolean) => void;
  value: boolean;
  label: string;
}
export const SwitchBoolean: React.FC<Props> = ({
  name,
  handleChange,
  value,
  label,
}) => {
  let helpfullLabel = label;
  let helpfullValue = value;
  let helpfullOnChange = handleChange;

  if (helpfullLabel.toLowerCase() === 'disabled') {
    if (value) {
      helpfullLabel = 'Disabled';
    } else {
      helpfullLabel = 'Enabled';
    }

    helpfullValue = !value;

    helpfullOnChange = (value) => handleChange(!value);
  }

  return (
    <Switch name={name} value={helpfullValue} onChange={helpfullOnChange}>
      {helpfullLabel}
    </Switch>
  );
};
