import { Modal } from '@cognite/cogs.js';
import { BaseModalProps } from './type';

export const BaseModal: React.FC<BaseModalProps> = ({
  children,
  ...props
}: BaseModalProps) => {
  return <Modal {...props}>{children}</Modal>;
};
