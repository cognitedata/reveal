import { useContext } from 'react';

import { UserHistoryContext } from './UserHistoryContext';

export const useCdfUserHistoryService = () => {
  const data = useContext(UserHistoryContext);

  if (data === undefined) {
    throw new Error(
      'useCdfUserHistoryService must be used inside UserHistoryProvider'
    );
  }

  return data.userHistoryService;
};
