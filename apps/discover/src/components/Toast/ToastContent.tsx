import { Typography } from 'components/Typography';

export const ToastContentWithTitle = (title: string, body: string) => {
  return (
    <div>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2">{body}</Typography>
    </div>
  );
};
