import { createContext } from 'react';
import { UnleashClient } from 'unleash-proxy-client';

type FlagState = {
  client: UnleashClient;
  isClientReady?: boolean;
};

export const FlagContext = createContext<FlagState>({} as FlagState);
