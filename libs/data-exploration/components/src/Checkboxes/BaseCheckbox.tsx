import { Checkbox, CheckboxProps } from '@cognite/cogs.js';

export const BaseCheckbox: React.FC<CheckboxProps> = ({
  ...props
}: CheckboxProps) => {
  return <Checkbox {...props} />;
};
