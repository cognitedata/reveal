/*
 * Copyright 2021 Cognite AS
 */

import React, { ReactElement } from 'react';
import { CogniteClient } from '@cognite/sdk-3.x';
import { loginManager } from '../utils/LoginManager';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import styled from 'styled-components';
import { REVEAL_VERSION } from '@cognite/reveal-3.x';

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

  const client = new CogniteClient({
    appId: 'reveal-docs-' + REVEAL_VERSION,
    project: 'publicdata',
    getToken: () => loginManager.getToken()
  });

  if (loginManager.isLoggedIn) {
    client.authenticate();
  }

  (window as any).sdk = client;

  const coverUrl = useBaseUrl('/img/login_cover.png');

  if (!loginManager.isLoggedIn) {
    return (
      <Root theme={{ isDarkTheme }}>
        <ImageOverlay coverUrl={coverUrl} />

        <CenteredContainer>
          <Section>
            This demo shows a real model from the{' '}
            <a
              href="https://openindustrialdata.com/get-started/"
              target="_blank"
            >
              Open Industrial Data Project
            </a>
            .
          </Section>

          <Section>You need to sign in to view it.</Section>

          <Section style={{ margin: '48px 0' }}>
            <button
              className="button button--primary button--lg"
              onClick={() => loginManager.loginPopup()}
              type="button"
            >
              Sign in
            </button>
          </Section>

          <Section>
            If you haven't registered yet, please navigate to{' '}
            <a
              href="https://hub.cognite.com/"
              target="_blank"
            >
              hub.cognite.com
            </a>{' '}
            and register a new account.
          </Section>
        </CenteredContainer>
      </Root>
    );
  }

  return props.children(client);
}
