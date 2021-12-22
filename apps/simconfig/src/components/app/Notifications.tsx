import { useEffect } from 'react';

import { ToastContainer, toast } from '@cognite/cogs.js';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { clearNotification } from 'store/notification';
import { NotificationType } from 'store/notification/types';
import type { StoreState } from 'store/types';

import { AUTOCLOSE_PERIOD } from './constants';
import type { ToastProps } from './Toast';
import Toast from './Toast';

const toastType = (type: NotificationType) => {
  const typeMap = {
    success: toast.success.bind(toast),
    error: toast.error.bind(toast),
    default: toast.open.bind(toast),
  };
  return typeMap[type];
};

function Notifications() {
  const {
    type = NotificationType.Default,
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
        key={new Date().getTime()}
        message={toastContent.message}
        title={toastContent.title}
      />,
      toastProps
    );
    dispatch(clearNotification());
  }, [type, title, message, dispatch]);
  return <ToastContainer style={{ marginTop: '40px' }} />;
}

export default Notifications;
