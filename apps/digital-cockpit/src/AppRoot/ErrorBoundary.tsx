import React, { useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store/types';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { clearNotification } from 'store/notification/actions';
import ErrorPage from 'pages/ErrorPage';

type Props = {
  children?: React.ReactNode;
};

const openToast = (type: string, child: React.ReactNode) => {
  if (type === 'error') {
    toast.error(child, { autoClose: 6000 });
  } else if (type === 'success') {
    toast.success(child, { autoClose: 2000 });
  } else {
    toast.open(child);
  }
};

const ErrorBoundary: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const {
    type = 'error',
    title,
    message = '',
  } = useSelector((state: StoreState) => state.notification);
  const dispatch = useDispatch();
  useEffect(() => {
    if (title) {
      openToast(
        type,
        <div>
          <h3>{title}</h3>
          {message}
        </div>
      );
      dispatch(clearNotification());
    }
  }, [type, title, message, dispatch]);
  try {
    return (
      <>
        <ToastContainer style={{ marginTop: '40px' }} />
        {children}
      </>
    );
  } catch (e) {
    Sentry.captureException(e);
    return <ErrorPage />;
  }
};
export default ErrorBoundary;
