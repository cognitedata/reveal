import { toast } from '@cognite/cogs.js';

export const Notification = ({
  type,
  message,
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}) => {
  const autoClose = 7000;

  if (type === 'info') {
    toast.info(message, {
      autoClose,
    });
  }

  if (type === 'success') {
    toast.success(message, {
      autoClose,
    });
  }

  if (type === 'error') {
    toast.error(message, {
      autoClose,
    });
  }

  if (type === 'warning') {
    toast.warning(message, {
      autoClose,
    });
  }
};
