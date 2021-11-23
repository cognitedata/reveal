import { useEffect } from 'react';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { NotificationType } from 'store/notification/types';
import { StoreState } from 'store/types';
import { clearNotification } from 'store/notification';

import Toast, { ToastProps } from './Toast';
import { AUTOCLOSE_PERIOD } from './constants';

const toastType = (type: NotificationType) => {
  const typeMap = {
    success: toast.success,
    error: toast.error,
    default: toast.open,
  };
  return typeMap[type];
};

const Notifications = () => {
  const {
    type = NotificationType.default,
    title,
    message = '',
  } = useAppSelector((state: StoreState) => state.notification);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!title) {
      return;
    }
    const toastContent: ToastProps = {
      title,
      message,
    };

    const toastProps = {
      autoClose: AUTOCLOSE_PERIOD,
    };
    toastType(type)(
      <Toast
        title={toastContent.title}
        message={toastContent.message}
        key={new Date().getTime()}
      />,
      toastProps
    );
    dispatch(clearNotification());
  }, [type, title, message, dispatch]);
  return <ToastContainer style={{ marginTop: '40px' }} />;
};

export default Notifications;
