import { toast, ToastProps } from '@cognite/cogs.js';
import { ValidationError } from '@platypus/platypus-core';

export const Notification = ({
  type,
  title = '',
  message,
  extra = undefined,
  options = {
    autoClose: 5000,
    position: 'bottom-right',
  },
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  title?: string;
  extra?: JSX.Element | null;
  options?: ToastProps;
}) => {
  const toastBody: JSX.Element[] = [];
  if (title) {
    toastBody.push(
      <h3 key="title" data-cy="toast-title">
        {title}
      </h3>
    );
  }

  toastBody.push(
    <p key="message" data-cy="toast-body">
      {message}
    </p>
  );

  if (extra) {
    toastBody.push(extra);
  }

  if (type === 'info') {
    toast.info(<div>{toastBody}</div>, options);
  }

  if (type === 'success') {
    toast.success(<div>{toastBody}</div>, options);
  }

  if (type === 'error') {
    // eslint-disable-next-line no-console
    console.error(toastBody);
    toast.error(<div>{toastBody}</div>, options);
  }

  if (type === 'warning') {
    toast.warning(<div>{toastBody}</div>, options);
  }
};

export const formatValidationErrors = (
  validationErrors?: ValidationError[]
) => {
  if (validationErrors && validationErrors.length) {
    return (
      <div
        key="errors"
        style={{
          display: 'block',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxHeight: '150px',
        }}
      >
        <ul>
          {validationErrors.map((err) => (
            <li key={err.message}>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  } else {
    return null;
  }
};
