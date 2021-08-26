import { Button, Icon, toast } from '@cognite/cogs.js';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import React from 'react';
import { ToastContentProps } from 'react-toastify/dist/types';
import styled from 'styled-components';

const WarnIconContainer = styled.div`
  color: var(--cogs-warning);
  width: 100px;
`;

const WarningToastContainer = styled.div`
  display: flex;
`;

const WarningToastButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 0;
`;

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

    const toastContent = (props: ToastContentProps) => {
      const btn = (
        <Button
          type="danger"
          size="small"
          onClick={() => {
            onConfirm();
            if (props.closeToast) {
              props.closeToast();
            }
          }}
        >
          {btnMsg}
        </Button>
      );

      return (
        <WarningToastContainer>
          <WarnIconContainer>
            <Icon type="WarningStroke" style={{ width: 25 }} />
          </WarnIconContainer>
          <div>
            <h3>{title}</h3>
            <div>{msg}</div>
            <WarningToastButtonContainer>
              <Button
                size="small"
                onClick={() => {
                  if (props.closeToast) {
                    props.closeToast();
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Close
              </Button>
              {btn}
            </WarningToastButtonContainer>
          </div>
        </WarningToastContainer>
      );
    };

    toast.open(toastContent, {
      autoClose: false,
      closeOnClick: false,
      toastId: key,
      style: {
        top: 100,
        width: 350,
      },
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
