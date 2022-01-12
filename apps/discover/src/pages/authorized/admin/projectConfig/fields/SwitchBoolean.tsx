import * as React from 'react';

import { Switch, Body } from '@cognite/cogs.js';

import { Subtitle } from 'components/typography/Subtitle';

export interface Props {
  name: string;
  handleChange: (value: boolean) => void;
  value: boolean;
  label: string;
  helpText?: string;
}
export const SwitchBoolean: React.FC<Props> = ({
  name,
  handleChange,
  value,
  label,
  helpText,
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
    <div>
      <Switch name={name} value={helpfullValue} onChange={helpfullOnChange}>
        <Body level={3} strong>
          {helpfullLabel}
        </Body>
      </Switch>
      {helpText && <Subtitle text={helpText} />}
    </div>
  );
};
