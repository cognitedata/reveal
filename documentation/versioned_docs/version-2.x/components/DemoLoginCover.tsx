/*
 * Copyright 2021 Cognite AS
 */

import React, { ReactElement, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk-2.x';
import { loginManager } from '../utils/LoginManager';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styled from 'styled-components';
import { useColorMode } from '@docusaurus/theme-common';

const Root = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: ${(props: { theme: { isDarkTheme: boolean } }) =>
    props.theme.isDarkTheme
      ? 'rgba(0, 0, 0, 0.85)'
      : 'rgba(255, 255, 255, 0.93)'};
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  text-align: center;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${(props: { coverUrl: string }) => props.coverUrl});
  z-index: -1;
`;

const Section = styled.div`
  display: inline-block;
  font-size: 1.5em;
  @media screen and (max-width: 480px) {
    font-size: 1em;
  }
`;

type Props = {
  children: (client: CogniteClient) => ReactElement;
};

export default function DemoLoginCover(props: Props): ReactElement {
  const isDarkTheme = useColorMode().colorMode === 'dark';

  const coverUrl = useBaseUrl('/img/login_cover.png');

  return (
    <Root theme={{ isDarkTheme }}>
      <ImageOverlay coverUrl={coverUrl} />
      <CenteredContainer>
        <Section>
          Live examples are not supported for this version.
        </Section>
        <Section>
          Please choose a newer version of the documentation to run live code examples.
        </Section>
      </CenteredContainer>
    </Root>
  );
}
