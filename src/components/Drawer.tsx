import { ReactNode } from 'react';
import styled from 'styled-components';

import {
  Button,
  Drawer as CogsDrawer,
  DrawerProps as CogsDrawerProps,
} from '@cognite/cogs.js';
// import AntdDrawer, { DrawerProps as AntdDrawerProps } from 'antd/lib/drawer';
import { getContainer } from 'utils/shared';
import noop from 'lodash/noop';

interface DrawerProps extends CogsDrawerProps {
  children: JSX.Element;
  visible: boolean;
  isPrimarySidebar?: boolean;
  title?: string;
  actions?: ReactNode;
  hideActions?: boolean;

  okText?: string;
  onOk?: (...args: any[]) => any;
  okDisabled?: boolean;
  okHidden?: boolean;
  okLoading?: boolean;

  cancelText?: string;
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
    isPrimarySidebar,
    title,
    actions = null,
    hideActions = false,

    okText = 'Ok',
    okDisabled = false,
    okHidden = false,
    okLoading = false,

    cancelText = 'Cancel',
    cancelDisabled = false,
    cancelHidden = false,
    cancelLoading = false,

    width = 720,
    ...otherProps
  } = props;

  // Cogs drawer does not handle this by default, so we have to assign an action
  const onCancel = props.onCancel || noop;
  const onOk = props.onOk || noop;

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
    <CogsDrawer
      visible={visible}
      title={title}
      width={width}
      className={isPrimarySidebar ? 'primary-sidebar' : ''}
      // bodyStyle={{ height: 'calc(100vh - 55px)', padding: 0 }}
      onClose={onCancel}
      getContainer={getContainer}
      {...otherProps}
    >
      <Content>{children}</Content>
      {!hideActions && <Actions>{getActions()}</Actions>}
    </CogsDrawer>
  );
};

export default Drawer;
