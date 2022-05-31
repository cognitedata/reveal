import { useState } from 'react';

import styled from 'styled-components/macro';

import type { ButtonType, DrawerProps, IconType } from '@cognite/cogs.js';
import { Button, Drawer, Graphic } from '@cognite/cogs.js';

interface InfoDrawerProps extends React.PropsWithChildren<DrawerProps> {
  buttonIcon?: IconType;
  buttonType?: ButtonType;
  buttonTitle?: string;
}

export function InfoDrawer({
  buttonIcon,
  buttonType,
  buttonTitle,
  children,
  ...drawerProps
}: InfoDrawerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <>
      <Button
        icon={buttonIcon ?? 'Info'}
        title="Display information"
        type={buttonType ?? 'ghost'}
        aria-label="Display information"
        onClick={() => {
          setIsVisible(true);
        }}
      >
        {buttonTitle}
      </Button>
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
