import { sizes } from 'styles/layout';
import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div<Props>`
  padding: ${(props) => (props.isFullScreen ? '0' : sizes.normal)};
  height: 100%;
`;

interface Props {
  // if true get's rid of padding
  isFullScreen: boolean;
}

export const Page: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  isFullScreen = true,
}) => <PageWrapper isFullScreen={isFullScreen}>{children}</PageWrapper>;
