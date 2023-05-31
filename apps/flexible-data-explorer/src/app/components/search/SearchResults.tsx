import React, { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { Chip, Title } from '@cognite/cogs.js';

import { getIcon } from '../../utils/getIcon';

export const SearchResults = ({
  children,
  empty,
}: PropsWithChildren<{ empty?: boolean }>) => {
  return (
    <Container empty={empty}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { empty } as any);
        }
        return null;
      })}
    </Container>
  );
};

const Header: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => {
  return (
    <HeaderContainer>
      <Chip icon={getIcon(title)} />
      <span>
        <Title level={6}>{title}</Title>
        {description && <Body>{description}</Body>}
      </span>
    </HeaderContainer>
  );
};

const Body: React.FC<PropsWithChildren<{ empty?: boolean }>> = ({
  children,
  empty,
}) => {
  if (empty) {
    return null;
  }

  return <>{children}</>;
};

const Footer: React.FC<PropsWithChildren<{ empty?: boolean }>> = ({
  children,
  empty,
}) => {
  if (empty) {
    return null;
  }

  return <FooterContainer>{children}</FooterContainer>;
};

SearchResults.Header = Header;
SearchResults.Body = Body;
SearchResults.Footer = Footer;

const Container = styled.div<{ empty?: boolean }>`
  border-radius: 10px;
  margin-bottom: 16px;

  ${(props) => {
    if (!props.empty) {
      return css`
        background-color: white;

        box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
          0px 1px 1px rgba(79, 82, 104, 0.1);
      `;
    }
  }}
`;

const HeaderContainer = styled.div`
  display: flex;
  padding: 16px;
  gap: 16px;
  align-items: center;
`;

const FooterContainer = styled.div`
  display: flex;
  padding: 16px;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;
