import { useState } from 'react';

import styled from 'styled-components/macro';

import type { DrawerProps } from '@cognite/cogs.js';
import { Button, Drawer, Graphic } from '@cognite/cogs.js';

export function InfoDrawer({
  children,
  ...drawerProps
}: React.PropsWithChildren<DrawerProps>) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <>
      <Button
        icon="Info"
        type="ghost"
        onClick={() => {
          setIsVisible(true);
        }}
      />
      <Drawer
        footer={<FooterGraphic type="Cognite" />}
        okText="Close"
        visible={isVisible}
        width={420}
        onCancel={() => {
          setIsVisible(false);
        }}
        onOk={() => {
          setIsVisible(false);
        }}
        {...drawerProps}
      >
        <InfoDrawerContainer>{children}</InfoDrawerContainer>
      </Drawer>
    </>
  );
}

const InfoDrawerContainer = styled.div`
  dl {
    dt {
      margin-bottom: 12px;
      &:not(:first-child) {
        margin-top: 24px;
      }
    }
  }
`;

const FooterGraphic = styled(Graphic)`
  margin: 0 auto;
`;
