import { toast } from '@cognite/cogs.js';
import { ValidationError } from '@platypus/platypus-core';

export const Notification = ({
  type,
  message,
  validationErrors = [],
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  validationErrors?: ValidationError[];
}) => {
  const autoClose = 5000;
  let errorMessage = <p>{message}</p>;

  if (validationErrors && validationErrors.length) {
    errorMessage = (
      <div>
        <p>{message}</p>
        {validationErrors.length && (
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
        )}
      </div>
    );
  }

  if (type === 'info') {
    toast.info(errorMessage, {
      autoClose,
    });
  }

  if (type === 'success') {
    toast.success(errorMessage, {
      autoClose,
    });
  }

  if (type === 'error') {
    console.error(message, validationErrors);
    toast.error(errorMessage, {
      autoClose,
    });
  }

  if (type === 'warning') {
    toast.warning(errorMessage, {
      autoClose,
    });
  }
};
