import * as React from 'react';

import { Switch, Body } from '@cognite/cogs.js';

import { SubtitlePlain } from 'components/Typography/SubtitlePlain';

export interface Props {
  name: string;
  handleChange: (value: boolean) => void;
  value?: boolean;
  label?: string;
  helpText?: string;
}
export const SwitchBoolean: React.FC<Props> = ({
  name,
  handleChange,
  value,
  label,
  helpText,
}) => {
  if (value === undefined || label === undefined) {
    return null;
  }

  return (
    <div>
      <Switch name={name} value={Boolean(value)} onChange={handleChange}>
        <Body level={3} strong>
          {label}
        </Body>
      </Switch>
      <SubtitlePlain>{helpText}</SubtitlePlain>
    </div>
  );
};
