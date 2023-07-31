import { toast } from '@cognite/cogs.js';

interface Props {
  message?: string;
  description?: string;
  autoClose?: false | number;
}

const toastWrapper = (
  toastFn: any,
  { message, description, autoClose }: Props
) => {
  toastFn(
    <div>
      <h3>{message}</h3>
      {description}
    </div>,
    {
      autoClose: autoClose || 5000,
      position: 'top-right',
    }
  );
};

const success = (props: Props) => {
  toastWrapper(toast.success, props);
};

const warning = (props: Props) => {
  toastWrapper(toast.warning, props);
};

const error = (props: Props) => {
  toastWrapper(toast.error, props);
};

export const notification = {
  success,
  warning,
  error,
};
