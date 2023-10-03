import { createContext } from 'react';

import { CdfUserHistoryService } from './CdfUserHistoryService';

export type UserHistoryContextType = {
  userHistoryService: CdfUserHistoryService;
};

export const UserHistoryContext = createContext<
  UserHistoryContextType | undefined
>(undefined);
