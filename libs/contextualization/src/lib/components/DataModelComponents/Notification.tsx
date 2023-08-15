import styled from 'styled-components';

import { Button, toast, ToastProps } from '@cognite/cogs.js';

export const Notification = ({
  type,
  title = '',
  message,
  errors,
  extra = undefined,
  options = {
    autoClose: 5000,
    position: 'bottom-right',
    style: {
      userSelect: 'all',
      wordBreak: 'break-all',
    },
  },
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  title?: string;
  extra?: JSX.Element | null;
  errors?: string | string[];
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
    <p
      key="message"
      data-cy="toast-body"
      style={{
        whiteSpace: 'pre-line',
      }}
    >
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
    toast.error(
      <ErrorWrapper>
        {toastBody}
        <Button
          id="error-copy"
          icon="Copy"
          aria-label="Copy error"
          size="small"
          type="secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(
              JSON.stringify({ title, message, extra, errors }, null, 2)
            );
          }}
        />
      </ErrorWrapper>,
      { autoClose: 7000, closeOnClick: false, ...options }
    );
  }

  if (type === 'warning') {
    toast.warning(<div>{toastBody}</div>, options);
  }
};

const ErrorWrapper = styled.div`
  && #error-copy i {
    margin: initial;
  }
  && #error-copy svg {
    width: initial;
    height: initial;
  }
`;
