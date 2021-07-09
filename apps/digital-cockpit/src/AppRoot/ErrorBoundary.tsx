import React, { useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store/types';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { clearNotification } from 'store/notification/actions';
import ErrorPage from 'pages/ErrorPage';
import Toast from './Toast';

type Props = {
  children?: React.ReactNode;
};

const toastType = (type: string) => {
  if (type === 'error') {
    return toast.error;
  }
  if (type === 'success') {
    return toast.success;
  }
  return toast.open;
};

const ErrorBoundary: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const {
    type = 'error',
    title,
    message = '',
    actions = [],
  } = useSelector((state: StoreState) => state.notification);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!title) {
      return;
    }
    const toastContent = {
      title,
      message,
      actions,
    };
    const hasActions = !!actions?.length;
    let autoClose: false | number | undefined;
    if (hasActions) {
      autoClose = false as const;
    } else if (type === 'error') {
      autoClose = 10000;
    } else {
      autoClose = 5000;
    }
    const toastProps = {
      autoClose,
    };
    toastType(type)(
      <Toast {...(toastContent as any)} key={new Date().getTime()} />,
      toastProps
    );
    dispatch(clearNotification());
  }, [type, title, message, actions, dispatch]);

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
export default React.memo(ErrorBoundary);
