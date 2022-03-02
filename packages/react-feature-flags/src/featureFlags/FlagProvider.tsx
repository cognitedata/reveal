/* eslint-disable react/require-default-props */
import { ReactNode, useEffect, useRef, useState } from 'react';
import { UnleashClient } from 'unleash-proxy-client';

import { FlagContext } from './FlagContext';

const DEFAULT_UNLEASH_PROXY_URL =
  'https://unleash-proxy.cognitedata-production.cognite.ai/proxy';

type Props = {
  appName: string;
  apiToken: string;
  projectName?: string;
  remoteAddress?: string;
  proxyUrl?: string;
  refreshInterval?: number;
  children: ReactNode;
  disableMetrics?: boolean;
};

export const FlagProvider = ({
  appName,
  apiToken,
  children,
  proxyUrl = DEFAULT_UNLEASH_PROXY_URL,
  refreshInterval /* This is defaulted to 30 sec by the unleash-proxy-client */,
  projectName,
  remoteAddress,
  disableMetrics,
}: Props) => {
  const [isClientReady, setIsClientReady] = useState(false);

  const client = useRef<UnleashClient>(
    new UnleashClient({
      appName,
      clientKey: apiToken,
      url: proxyUrl,
      refreshInterval,
      disableMetrics,
    })
  );

  useEffect(() => {
    if (projectName) {
      const context: { [id: string]: string } = {
        /*
         * For simplicity and unsupported strategies in the unleash proxy,
         * we use project as userId to enable a default rollout strategy
         */
        userId: projectName,
      };
      if (remoteAddress) {
        context.remoteAddress = remoteAddress;
      }
      client.current.updateContext(context);

      client.current.on('ready', () => {
        setIsClientReady(true);
      });

      client.current.start();
    }

    return () => {
      client.current.stop();
    };
  }, [projectName, remoteAddress]);

  if (!client.current) return null;

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue = { client: client.current, isClientReady };

  return (
    <FlagContext.Provider value={contextValue}>{children}</FlagContext.Provider>
  );
};
