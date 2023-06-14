import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Icon, IconType, Title } from '@cognite/cogs.js';
import { DivFlex } from 'components/styled';

export const PageTitle = styled((props) => (
  <HeadingWithUnderline {...props} level={1}>
    {props.children}
  </HeadingWithUnderline>
))`
  font-size: 1.5rem;
`;

export const HeadingWithUnderline = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  position: relative;
`;
export const StyledTitle2 = styled((props) => (
  <Title {...props} level={2}>
    {props.children}
  </Title>
))`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;
type IconHeadingProps = {
  icon: IconType;
};
export const IconHeading = ({
  icon,
  children,
}: PropsWithChildren<IconHeadingProps>) => {
  return (
    <DivFlex align="center" gap="0.5rem">
      <Icon type={icon} />
      <StyledTitle3 noMargin level={3}>
        {children}
      </StyledTitle3>
    </DivFlex>
  );
};
export const StyledTitle3 = styled((props) => (
  <Title {...props} level={3}>
    {props.children}
  </Title>
))`
  font-size: 1rem;
  margin-bottom: ${(props) => (props.noMargin ? '0' : '1rem')};
`;
