/* eslint-disable react/require-default-props */
import React, { ReactNode, useEffect, useRef } from 'react';
import { UnleashClient } from 'unleash-proxy-client';
import { FlagContext } from './FlagContext';

const DEFAULT_UNLEASH_PROXY_URL =
  'https://unleash-proxy.cognitedata-production.cognite.ai/proxy';

type Props = {
  appName: string;
  apiToken: string;
  projectName?: string;
  proxyUrl?: string;
  refreshInterval?: number;
  children: ReactNode;
};

export const FlagProvider = ({
  appName,
  apiToken,
  children,
  proxyUrl = DEFAULT_UNLEASH_PROXY_URL,
  refreshInterval /* This is defaulted to 30 sec by the unleash-proxy-client */,
  projectName,
}: Props) => {
  const client = useRef<UnleashClient>(
    new UnleashClient({
      appName,
      clientKey: apiToken,
      url: proxyUrl,
      refreshInterval,
    })
  );

  useEffect(() => {
    if (projectName) {
      const context = {
        /*
         * For simplicity and unsupported strategies in the unleash proxy,
         * we use project as userId to enable a default rollout strategy
         */
        userId: projectName,
      };
      client.current.updateContext(context);
      client.current.start();
    }

    return () => {
      client.current.stop();
    };
  }, [projectName]);

  if (!client.current) return null;

  const contextValue = { client: client.current };

  return (
    <FlagContext.Provider value={contextValue}>{children}</FlagContext.Provider>
  );
};
