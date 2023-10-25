import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ForwardedRef,
  useImperativeHandle,
} from 'react';

import styled from 'styled-components';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk, { getToken, getUserInformation } from '@cognite/cdf-sdk-singleton';
import { isDevelopment, isStaging } from '@cognite/cdf-utilities';
import { Flex, Modal } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { BaseEventData, TrackingEvent } from '../../utils/types';

let notebook_origin = 'https://notebook-standalone.cogniteapp.com';
if (isStaging() || isDevelopment()) {
  notebook_origin = 'https://notebook-standalone.staging.cogniteapp.com';
}

if ((window as any).CDF_NOTEBOOK_ORIGIN_OVERRIDE) {
  notebook_origin = (window as any).CDF_NOTEBOOK_ORIGIN_OVERRIDE;
}

export const NOTEBOOK_ORIGIN = notebook_origin;

const TRACKED_EVENTS = ['NotebookCopilotEvent', 'NotebookEvent'];
const typesafeTrack = <T extends keyof TrackingEvent>(
  eventName: string,
  payload: TrackingEvent[T]
) => trackEvent(eventName, payload);

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

    const { isEnabled } = useFlag('NOTEBOOK_AI_CODEGEN');

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

    // Add handler for messages from notebook
    useEffect(() => {
      trackEvent('Notebook.Start');
      const handler = async (event: MessageEvent<any>) => {
        if (event.data === 'getToken') {
          await fetchAndSendToken();
        }

        const eventData: BaseEventData = event?.data;
        if (TRACKED_EVENTS.includes(eventData?.event)) {
          const eventActor = eventData.event.replace('Event', '');
          const { eventName } = event.data.data;
          typesafeTrack(`${eventActor}.${eventName}`, event.data.data.data);
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

    /**
     * Detect multiple tabs with same page open
     * This is a temporary workaround for https://cognitedata.atlassian.net/browse/AI-270 and should be removed when the bug is fixed.
     * For an explanation how this routine works, see https://adnan-tech.com/detect-multiple-tabs-opened-at-same-time-javascript/
     */
    const [showMultipleTabsWarning, setShowMultipleTabsWarning] =
      useState<boolean>(false);
    useEffect(() => {
      // Broadcast that you're opening a page.
      localStorage.cdf_notebook_open_page = Date.now();
      window.addEventListener('storage', storageEventListener, false);

      function storageEventListener(e: StorageEvent) {
        if (e.key === 'cdf_notebook_open_page') {
          // Listen if anybody else is opening the same page!
          localStorage.cdf_notebook_page_lock = Date.now();
        }
        if (e.key === 'cdf_notebook_page_lock') {
          trackEvent('NotebookMultipleTabsWarning');
          setShowMultipleTabsWarning(true);
        }
      }

      return () => {
        window.removeEventListener('storage', storageEventListener);
      };
    });

    return (
      <Flex style={{ height: '100%' }}>
        <IFrame
          data-testid="iframe-for-notebook"
          ref={myIframe}
          src={`${NOTEBOOK_ORIGIN}/lab/index.html?nocache=${Date.now()}${
            isEnabled ? '' : '&aiDisabled=true'
          }}`}
        ></IFrame>
        <Modal
          visible={showMultipleTabsWarning}
          title="Duplicate Jupyter Tabs Detected"
          closable={false}
          hideFooter
        >
          Working with Jupyter notebooks concurrently in multiple tabs is not
          yet supported. Please close all duplicate tabs and refresh the page.
        </Modal>
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
