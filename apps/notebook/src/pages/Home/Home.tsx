import React, {
  useCallback,
  useEffect,
  useRef,
  ForwardedRef,
  useImperativeHandle,
} from 'react';

import styled from 'styled-components';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk, { getToken, getUserInformation } from '@cognite/cdf-sdk-singleton';
import { Flex } from '@cognite/cogs.js';

let notebook_origin = 'https://notebook-standalone.cogniteapp.com';
if ((window as any).CDF_NOTEBOOK_ORIGIN_OVERRIDE) {
  notebook_origin = (window as any).CDF_NOTEBOOK_ORIGIN_OVERRIDE;
}

export const NOTEBOOK_ORIGIN = notebook_origin;

// Every 2 minutes
const INTERVAL = 2 * 60 * 1000;

type Props = {
  recheckTokenInterval?: number;
};

const Home = React.forwardRef(
  (
    { recheckTokenInterval = INTERVAL }: Props,
    ref: ForwardedRef<HTMLIFrameElement | null>
  ) => {
    const myIframe = useRef<HTMLIFrameElement>(null);

    const fetchAndSendToken = useCallback(async () => {
      return getToken().then(async (newToken) => {
        const userInfo = (await getUserInformation()) as {
          email?: string;
          mail?: string;
        };
        const email = userInfo?.email || userInfo?.mail;
        // send token only if the token has changed since last time
        myIframe.current?.contentWindow?.postMessage(
          {
            token: newToken,
            baseUrl: sdk.getBaseUrl(),
            project: sdk.project,
            email,
          },
          NOTEBOOK_ORIGIN
        );

        return newToken;
      });
    }, []);

    // Add handler from notebook
    useEffect(() => {
      trackEvent('Notebook.Start');
      const handler = async (event: MessageEvent<any>) => {
        if (event.data === 'getToken') {
          await fetchAndSendToken();
        }
      };

      window.addEventListener('message', handler, false);
      return () => {
        window.removeEventListener('message', handler);
      };
    }, [fetchAndSendToken]);

    // Add interval for checking token
    useEffect(() => {
      const interval = setInterval(
        () => fetchAndSendToken(),
        // try and fetch token every 2 minutes
        recheckTokenInterval
      );
      return () => {
        if (interval) {
          clearTimeout(interval);
        }
      };
    }, [fetchAndSendToken, recheckTokenInterval]);

    useImperativeHandle(ref, () => myIframe.current as any);

    return (
      <Flex style={{ height: '100%' }}>
        <IFrame
          data-testid="iframe-for-notebook"
          ref={myIframe}
          src={`${NOTEBOOK_ORIGIN}/lab/index.html?nocache=${Date.now()}`}
        ></IFrame>
      </Flex>
    );
  }
);

Home.displayName = 'Home';

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
`;

export default Home;
