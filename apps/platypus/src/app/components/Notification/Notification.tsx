import { toast, ToastProps } from '@cognite/cogs.js';
import { ValidationError } from '@platypus/platypus-core';

export const Notification = ({
  type,
  title = '',
  message,
  validationErrors = [],
  options = {
    autoClose: 5000,
    position: 'bottom-right',
  },
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  title?: string;
  validationErrors?: ValidationError[];
  options?: ToastProps;
}) => {
  const toastBody: JSX.Element[] = [];
  if (title) {
    toastBody.push(<h3 data-cy="toast-title">{title}</h3>);
  }

  toastBody.push(<p>{message}</p>);

  if (validationErrors && validationErrors.length) {
    toastBody.push(
      <div
        style={{
          display: 'block',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxHeight: '150px',
        }}
      >
        <ul>
          {validationErrors.map((err, idx) => (
            <li key={idx}>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'info') {
    toast.info(<div>{toastBody}</div>, options);
  }

  if (type === 'success') {
    toast.success(<div>{toastBody}</div>, options);
  }

  if (type === 'error') {
    console.error(toastBody, validationErrors);
    toast.error(<div>{toastBody}</div>, options);
  }

  if (type === 'warning') {
    toast.warning(<div>{toastBody}</div>, options);
  }
};
