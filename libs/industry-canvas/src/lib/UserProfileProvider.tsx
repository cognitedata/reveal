import { useContext } from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { AppContext } from '@data-exploration-lib/core';

import { NoAccessPage } from './components/NoAccessPage';
import {
  UserProfileContext,
  useUserProfile,
} from './hooks/use-query/useUserProfile';

export const UserProfileProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const context = useContext(AppContext);
  const {
    data: hasDataModelInstancesReadAcl,
    isLoading: isLoadingHasDataModelInstancesReadAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelInstancesAcl',
    'READ',
    undefined,
    { enabled: !!context?.flow }
  );

  const {
    data: hasDataModelInstancesWriteAcl,
    isLoading: isLoadingHasDataModelInstancesWriteAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelInstancesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const { data: hasDataModelReadAcl, isLoading: isLoadingHasDataModelReadAcl } =
    usePermissions(context?.flow as any, 'dataModelsAcl', 'READ', undefined, {
      enabled: !!context?.flow,
    });

  const {
    data: userProfile,
    isLoading: isLoadingUserProfile,
    error: userProfileError,
  } = useUserProfile();

  if (
    isLoadingHasDataModelInstancesReadAcl ||
    isLoadingHasDataModelInstancesWriteAcl ||
    isLoadingHasDataModelReadAcl ||
    isLoadingUserProfile
  ) {
    return (
      <LoaderWrapper>
        <Icon type="Loader" />;
      </LoaderWrapper>
    );
  }

  const doesNotHaveUserProfileAccess = userProfileError?.status === 403;
  if (
    !hasDataModelInstancesReadAcl ||
    !hasDataModelInstancesWriteAcl ||
    !hasDataModelReadAcl ||
    doesNotHaveUserProfileAccess
  ) {
    return <NoAccessPage />;
  }

  if (userProfile === undefined) {
    return <NoAccessPage />;
  }

  return (
    <UserProfileContext.Provider value={{ userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

const LoaderWrapper = styled.div`
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  color: ${Colors['decorative--grayscale--400']};

  svg {
    width: 100%;
    height: 100%;
    width: 36px;
    height: 36px;
  }
`;
