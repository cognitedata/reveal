import { Button, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { Drawer } from 'antd';
import { Divider } from '@cognite/data-exploration';

export const AnnotationDrawer = (props: {
  visible: boolean;
  onClose: () => void;
  title: string;
  disableFooterButtons: boolean;
  onCreate: () => void;
  onDelete: () => void;
  children: any;
}) => {
  const { title, visible, onClose, children } = props;
  return (
    <Drawer
      placement="right"
      onClose={() => {}}
      visible={visible}
      closable={false}
      mask={false}
      getContainer={false}
      style={{
        top: 'var(--cdf-ui-navigation-height)',
        height: 'calc(100vh - var(--cdf-ui-navigation-height))',
      }}
      bodyStyle={{ backgroundColor: '#FFFFFF', padding: 0 }}
      width={380}
    >
      <DrawerContent>
        <DrawerCloseButtonRow>
          <DrawerCloseButton
            icon="Close"
            type="ghost"
            onClick={onClose}
            aria-label="close drawer"
          />
        </DrawerCloseButtonRow>
        <DrawerBodyContent>
          <DrawerTitleRow>
            <Title level={3}>{title}</Title>
          </DrawerTitleRow>
          <DrawerDetailsContainer>{children}</DrawerDetailsContainer>
          <DrawerFooterRow>
            <Divider.Horizontal />
            <DrawerFooterButtonRow>
              <Button
                type="primary"
                icon="Add"
                onClick={props.onCreate}
                disabled={props.disableFooterButtons}
              >
                Create
              </Button>
              <DrawerDeleteButton
                type="danger"
                icon="Delete"
                onClick={props.onDelete}
                disabled={props.disableFooterButtons}
                aria-label="delete drawer content"
              />
            </DrawerFooterButtonRow>
          </DrawerFooterRow>
        </DrawerBodyContent>
      </DrawerContent>
    </Drawer>
  );
};

const DrawerContent = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40px auto;
`;

const DrawerBodyContent = styled.div`
  padding: 8px 30px;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 32px auto 85px;
`;

const DrawerTitleRow = styled.div`
  display: flex;
`;

const DrawerDetailsContainer = styled.div`
  width: 100%;
  padding: 15px 0;
`;

const DrawerCloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DrawerCloseButton = styled(Button)`
  color: black;
`;

const DrawerFooterRow = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 12px auto;
`;

const DrawerFooterButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DrawerDeleteButton = styled(Button)`
  background-color: #c13670;
`;
