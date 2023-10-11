import { UserHistoryProvider } from '@user-history';

import { SubAppWrapper, getCluster, getProject } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import { useUserInformation } from './hooks/useUserInformation';

export interface FusionSubAppContainerProps {
  children: React.ReactNode;
}
export const SubAppContainer = ({ children }: FusionSubAppContainerProps) => {
  const cluster = getCluster() ?? undefined;
  const project = getProject();
  const { data: user, isFetched } = useUserInformation();
  const userId = user?.id;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <UserHistoryProvider cluster={cluster} project={project} userId={userId}>
      <SubAppWrapper title="Data Models">{children}</SubAppWrapper>
    </UserHistoryProvider>
  );
};
