import React, { PropsWithChildren, useCallback, useRef } from 'react';

import { Chameleon } from './chameleon';

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  [key: string]: string;
};

export type ChameleonProviderProps = {
  userInfo: UserInfo;
  project: string;
  children?: React.ReactNode;
  disableChameleonList?: string[];
};

export type ChameleonContextType = {
  chameleonTrack?: (trackEvent: string) => void;
};

export const ChameleonContext = React.createContext<ChameleonContextType>({});

export const useChameleonTrack = () => {
  const context = React.useContext(ChameleonContext);
  if (context === undefined) {
    throw new Error(
      'useChameleonTrack must be used within a ChameleonProvider'
    );
  }
  return context;
};

export const ChameleonProvider: React.FC<
  PropsWithChildren<ChameleonProviderProps>
> = ({ children, userInfo, project, disableChameleonList }) => {
  const chameleon = useRef(new Chameleon(disableChameleonList));

  if (sessionStorage.getItem('isE2eTest') !== 'true') {
    chameleon.current.initialize();
  }

  if (userInfo && project) {
    const { id, name, email, ...rest } = userInfo;
    chameleon.current.identify(id, {
      ...rest,
      name: name,
      email: email,
      project,
    });
  }

  const chameleonTrack = useCallback(
    (trackEvent: string) => {
      chameleon.current.track(trackEvent);
    },
    [chameleon]
  );

  return (
    <ChameleonContext.Provider value={{ chameleonTrack }}>
      {children}
    </ChameleonContext.Provider>
  );
};
