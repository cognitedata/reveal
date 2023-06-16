import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';

import { CdfHistoryUser, CdfUserHistoryService } from '../../utils/history';

export type SubAppContextData = {
  userHistoryService: CdfUserHistoryService;
};

export type SubAppContextProviderProps = {
  user: CdfHistoryUser;
};

const SubAppContext = createContext<SubAppContextData | undefined>(undefined);

export const SubAppProvider = ({
  children,
  user,
}: PropsWithChildren<SubAppContextProviderProps>) => {
  const data = useMemo(() => {
    if (user) {
      const userHistoryService = new CdfUserHistoryService(user);
      return { userHistoryService };
    }

    return undefined;
  }, [user]);

  return (
    <SubAppContext.Provider value={data}>{children}</SubAppContext.Provider>
  );
};

export const useCdfUserHistoryService = () => {
  const data = useContext(SubAppContext);

  if (data === undefined) {
    throw new Error(
      'useCdfUserHistoryService must be used inside SubAppProvider'
    );
  }

  return data.userHistoryService;
};
