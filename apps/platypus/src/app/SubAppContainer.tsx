import { useUserInformation } from '@platypus-app/hooks/useUserInformation';

import { SubAppWrapper } from '@cognite/cdf-utilities';

export interface FusionSubAppContainerProps {
  children: React.ReactNode;
}
export const SubAppContainer = ({ children }: FusionSubAppContainerProps) => {
  const { data: userData }: any = useUserInformation();

  return (
    <SubAppWrapper title="Data Models" userId={userData?.id}>
      {children}
    </SubAppWrapper>
  );
};
