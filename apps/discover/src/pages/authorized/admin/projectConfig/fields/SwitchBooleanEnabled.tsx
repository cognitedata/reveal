import * as React from 'react';

import { SwitchBoolean } from './SwitchBoolean';

export interface Props {
  name: string;
  handleChange: (value: boolean) => void;
  value: boolean;
  helpText?: string;
}
/**
 * this component is used to make the radio switch inverted
 * this is useful in the case when the flag we have in config is 'disabled'
 * it is confusing for the user to 'enable disabled'
 * so we invert it here to make it display simply 'enabled'
 */
export const SwitchBooleanEnabled: React.FC<Props> = ({
  name,
  handleChange,
  value,
  helpText,
}) => {
  const [switchValue, setSwitchValue] = React.useState<boolean | undefined>();
  const [labelText, setLabelText] = React.useState<string | undefined>();

  const helpfullOnChange = (value: boolean) => {
    handleChange(!value);
    setSwitchValue(value);
  };

  const toggleLabel = (value: boolean) => {
    if (value) {
      setLabelText('Enabled');
    } else {
      setLabelText('Disabled');
    }
  };

  React.useEffect(() => {
    setSwitchValue(!value);
    toggleLabel(!value);
  }, [value]);

  return (
    <SwitchBoolean
      name={name}
      label={labelText}
      helpText={helpText}
      value={switchValue}
      handleChange={helpfullOnChange}
    />
  );
};
