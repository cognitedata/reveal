import { Title, Body } from '@cognite/cogs.js';

export const ToastContentWithTitle = (title: string, body: string) => {
  return (
    <div>
      <Title>{title}</Title>
      <Body>{body}</Body>
    </div>
  );
};
