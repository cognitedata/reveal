import React from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { SecondaryTopbar, createLink } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';

const SECONDARY_TOPBAR_HEIGHT = 56;
const FOOTER_HEIGHT = 53;

type PageProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  subtitle?: string;
  title: string;
  extraContent?: React.ReactNode;
};

const Page = ({
  children,
  footer,
  subtitle,
  title,
  extraContent,
}: PageProps): JSX.Element => {
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <Container>
      <SecondaryTopbar
        subtitle={subtitle}
        title={title}
        extraContent={extraContent}
        goBackFallback={createLink(`/${subAppPath}`)}
      />
      <Content $hasFooter={!!footer}>{children}</Content>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--strong']};
  height: 100%;
`;

const Content = styled.div<{ $hasFooter?: boolean }>`
  border-top: 1px solid ${Colors['border--interactive--default']};
  height: calc(
    100% -
      ${({ $hasFooter }) =>
        $hasFooter
          ? FOOTER_HEIGHT + SECONDARY_TOPBAR_HEIGHT
          : SECONDARY_TOPBAR_HEIGHT}px
  );
  overflow-y: auto;
`;

const Footer = styled.div`
  height: 53px;
`;

export default Page;
