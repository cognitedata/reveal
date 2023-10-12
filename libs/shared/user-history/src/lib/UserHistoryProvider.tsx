import { PropsWithChildren, useMemo } from 'react';

import { CdfHistoryUser } from './CdfHistoryUser';
import { CdfUserHistoryService } from './CdfUserHistoryService';
import { UserHistoryContext } from './UserHistoryContext';

export type UserHistoryProviderProps = {
  /**
   * The cluster that we store events for.
   */
  cluster: string | undefined;
  /**
   * The unique project we store events for, belongs to a cluster.
   */
  project: string;
  /**
   * The id of the user we get from the IdP.
   */
  userId: string | undefined;
};

export const UserHistoryProvider = ({
  children,
  project,
  // In case the user id is not transferred from the Idp, we will set it to unknown.
  userId = 'unknown',
  // In case the cluster by some reason has not been provided, we will default to
  // the base cluster.
  cluster = 'https://api.cognitedata.com',
}: PropsWithChildren<UserHistoryProviderProps>) => {
  const user: CdfHistoryUser = useMemo(
    () => ({
      cluster,
      project,
      id: userId,
    }),
    [cluster, project, userId]
  );

  const data = useMemo(() => {
    if (user) {
      const userHistoryService = new CdfUserHistoryService(user);
      return { userHistoryService };
    }

    return undefined;
  }, [user]);

  return (
    <UserHistoryContext.Provider value={data}>
      {children}
    </UserHistoryContext.Provider>
  );
};
