import { ReactNode } from 'react';
import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import AntdDrawer, { DrawerProps as AntdDrawerProps } from 'antd/lib/drawer';
import { getContainer } from 'utils/shared';
import noop from 'lodash/noop';

interface DrawerProps extends AntdDrawerProps {
  children: JSX.Element;
  visible: boolean;
  title?: ReactNode;
  actions?: ReactNode;
  hideActions?: boolean;

  okText?: ReactNode;
  onOk?: (...args: any[]) => any;
  okDisabled?: boolean;
  okHidden?: boolean;
  okLoading?: boolean;

  cancelText?: ReactNode;
  onCancel?: (...args: any[]) => any;
  cancelDisabled?: boolean;
  cancelHidden?: boolean;
  cancelLoading?: boolean;
}

const ContentWithTitle = styled.div`
  height: calc(100vh - 112px);
  overflow-y: auto;
  padding: 24px;
`;

const ContentWithoutTitle = styled.div`
  height: calc(100vh - 57px);
  overflow-y: auto;
  padding: 24px;
`;

const Actions = styled.div`
  width: 100%;
  height: 57px;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  text-align: right;
`;

const Drawer = (props: DrawerProps): JSX.Element => {
  const {
    children,
    visible,
    title,
    actions = null,
    hideActions = false,

    okText = 'Ok',
    onOk = noop,
    okDisabled = false,
    okHidden = false,
    okLoading = false,

    cancelText = 'Cancel',
    onCancel = noop,
    cancelDisabled = false,
    cancelHidden = false,
    cancelLoading = false,

    width = 720,
    ...otherProps
  } = props;

  const getCancelButton = () =>
    !cancelHidden && (
      <Button
        onClick={onCancel}
        style={{ marginRight: 8 }}
        disabled={cancelDisabled}
        loading={cancelLoading}
      >
        {cancelText}
      </Button>
    );

  const getOkButton = () =>
    !okHidden && (
      <Button
        type="primary"
        onClick={onOk}
        disabled={okDisabled}
        loading={okLoading}
      >
        {okText}
      </Button>
    );

  const getActions = () =>
    actions || (
      <>
        {getCancelButton()}
        {getOkButton()}
      </>
    );

  const Content = title ? ContentWithTitle : ContentWithoutTitle;

  return (
    <AntdDrawer
      visible={visible}
      title={title}
      width={width}
      bodyStyle={{ height: 'calc(100vh - 55px)', padding: 0 }}
      onClose={onCancel}
      getContainer={getContainer}
      {...otherProps}
    >
      <Content>{children}</Content>
      {!hideActions && <Actions>{getActions()}</Actions>}
    </AntdDrawer>
  );
};

export default Drawer;
