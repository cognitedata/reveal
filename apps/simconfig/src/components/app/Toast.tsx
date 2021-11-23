import { Body, Title } from '@cognite/cogs.js';

import { ToastInnerContainer } from './elements';

export type ToastProps = {
  title: string;
  message?: string;
};

const Toast = ({ title, message = '' }: React.PropsWithoutRef<ToastProps>) => {
  return (
    <ToastInnerContainer>
      <Title level={2}>{title}</Title>
      <Body level={2}>{message}</Body>
    </ToastInnerContainer>
  );
};

export default Toast;
