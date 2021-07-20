import { Button, Icon } from '@cognite/cogs.js';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import React from 'react';

export class ToastUtils {
  public static onSuccess(msg: string) {
    notification.success({
      message: msg,
    });
  }

  public static onFailure(msg: string) {
    notification.error({
      message: msg,
    });
  }

  public static onWarn(
    title: string,
    msg: string,
    onConfirm: () => void,
    btnMsg: string
  ) {
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="danger"
        size="small"
        onClick={() => {
          onConfirm();
          notification.close(key);
        }}
      >
        {btnMsg}
      </Button>
    );
    let options: any = { duration: 0 };

    if (!!onConfirm && !!btnMsg) {
      options = { ...options, btn, key };
    }

    notification.warn({
      message: title,
      description: msg,
      ...options,
    });
  }
}

export const toastProps = {
  key: 'inProgressToast',
  top: 170,
  closeIcon: <div />,
  icon: <Icon type="Info" style={{ color: '#4A67FB' }} />,
  message: '',
  description:
    'Processing files. Please do not leave this page until it is done.',
  style: {
    background: '#F6F7FF',
    border: '1px solid #4A67FB',
    boxSizing: 'border-box',
    borderRadius: '5px',
    boxShadow: 'none',
    color: '#4A67FB',
  },
} as ArgsProps;
