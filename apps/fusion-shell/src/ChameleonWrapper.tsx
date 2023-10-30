import { PropsWithChildren } from 'react';

import { getProject } from '@cognite/cdf-utilities';
import { ChameleonProvider } from '@cognite/chameleon';

import { useUserInformation } from './app/hooks';

export const ChameleonWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const project = getProject();
  const { data: userInfo, isFetched, isError } = useUserInformation();

  if (isError || !isFetched || userInfo === undefined) {
    return <>{children}</>;
  }

  return (
    <ChameleonProvider
      project={project}
      userInfo={{
        id: userInfo.id,
        email: userInfo.mail || '',
        name: userInfo.displayName || '',
      }}
    >
      {children}
    </ChameleonProvider>
  );
};
