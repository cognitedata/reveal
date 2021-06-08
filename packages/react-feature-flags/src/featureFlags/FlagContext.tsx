import { createContext } from 'react';
import { UnleashClient } from 'unleash-proxy-client';

export const FlagContext = createContext<{ client: UnleashClient }>(
  {} as { client: UnleashClient }
);
