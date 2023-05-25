import React, { PropsWithChildren } from 'react';
import { zIndex } from '@data-exploration-lib/core';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

interface DrawerProps {
  visible?: boolean;
  width?: string;
  onClose: () => void;
}

export const Drawer: React.FC<PropsWithChildren<DrawerProps>> = ({
  visible,
  onClose,
  ...rest
}) => {
  return (
    <>
      <StyledDrawer visible={visible} {...rest}></StyledDrawer>
      <Overlay visible={visible} onClick={onClose} />
      {visible && (
        <ClosedButton>
          <Button
            type="tertiary"
            aria-label="Close button"
            icon="Close"
            onClick={onClose}
          />
        </ClosedButton>
      )}
    </>
  );
};

const StyledDrawer = styled.div<{ visible?: boolean; width?: string }>`
  position: absolute;
  top: 0;
  right: 0;
  isolation: isolate;
  width: ${({ visible, width = '80vw' }) => (visible ? width : '0')};
  height: 100%;
  z-index: ${zIndex.DRAWER};
  background: #fff;
  transition: 0.3s all;
`;
const Overlay = styled.div<{ visible?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100%;
  z-index: ${zIndex.OVERLAY};
  display: ${(props) => (props.visible ? 'block' : 'none')};
  background-color: ${(props) =>
    props.visible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0,0,0,0)'};
  transition: 0.3s all;
`;

const ClosedButton = styled.div`
  position: absolute;
  top: 30px;
  left: 16%;
  z-index: ${zIndex.DRAWER};
`;
