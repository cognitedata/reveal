import { useInjection as useBrandiInjection } from 'brandi-react';
import { TokenValue, TokenType } from 'brandi';

// Just a wrapper arround brandi hook
// To avoid direct dependency to the third party hook
// Easier to control if we want to change something
export const useInjection = <T extends TokenValue>(token: T): TokenType<T> => {
  return useBrandiInjection(token);
};
