import { Typography } from 'components/typography';

export const ToastContentWithTitle = (title: string, body: string) => {
  return (
    <div>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body1">{body}</Typography>
    </div>
  );
};
