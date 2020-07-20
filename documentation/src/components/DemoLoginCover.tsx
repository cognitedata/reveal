/*
 * Copyright 2020 Cognite AS
 */

import React, { ReactElement, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { loginManager } from '../utils/LoginManager';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styled from 'styled-components';
import useThemeContext from '@theme/hooks/useThemeContext';

const Root = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: ${(props) =>
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

const ImageOverlay = styled.div<{ coverUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${(props) => props.coverUrl});
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
  const { isDarkTheme } = useThemeContext();
  const [isLoggedIn, setIsLoggedIn] = React.useState(loginManager.isLoggedIn);
  useEffect(() => {
    return loginManager.onIsLoggedInChanged(setIsLoggedIn);
  }, []);

  const coverUrl = useBaseUrl('/img/login_cover.png');

  if (!isLoggedIn) {
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
              onClick={() => loginManager.authenticate()}
              type="button"
            >
              Sign in
            </button>
          </Section>

          <Section>
            If you haven't registered yet, please navigate to{' '}
            <a
              href="https://openindustrialdata.com/get-started/"
              target="_blank"
            >
              openindustrialdata.com
            </a>{' '}
            and register with your google account.
          </Section>
        </CenteredContainer>

        <Section style={{ marginTop: 'auto', textAlign: 'right' }}>
          <a href={useBaseUrl('img/publicdata_register.png')} target="_blank">
            visual instruction
          </a>
        </Section>
      </Root>
    );
  }

  return props.children(loginManager.client);
}
