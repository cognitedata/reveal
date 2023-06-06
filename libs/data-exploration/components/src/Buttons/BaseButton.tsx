import { Button, ButtonProps } from '@cognite/cogs.js';

export const BaseButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return <Button {...props} />;
};
