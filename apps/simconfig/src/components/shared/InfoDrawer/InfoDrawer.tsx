import { useState } from 'react';

import styled from 'styled-components/macro';

import type { DrawerProps } from '@cognite/cogs.js-v9';
import { Button, CogniteLogo, Drawer, Flex } from '@cognite/cogs.js-v9';

interface InfoDrawerProps extends React.PropsWithChildren<DrawerProps> {
  buttonTitle?: string;
}

export function InfoDrawer({
  buttonTitle,
  children,
  ...drawerProps
}: InfoDrawerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <>
      <Button
        aria-label="Display information"
        icon="Info"
        title="Display information"
        type="ghost"
        onClick={() => {
          setIsVisible(true);
        }}
      >
        {buttonTitle}
      </Button>
      <Drawer
        footer={
          <Flex justifyContent="center">
            <CogniteLogo type="logomark" />
          </Flex>
        }
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
