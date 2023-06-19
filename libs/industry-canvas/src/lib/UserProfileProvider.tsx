import { createContext, useContext, useEffect, useState } from 'react';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';

import { Colors, Icon } from '@cognite/cogs.js';
import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { AppContext } from '@data-exploration-lib/core';

import { NoAccessPage } from './components/NoAccessPage';
import { SpaceDoesNotExistPage } from './components/SpaceDoesNotExistPage';
import { QueryKeys } from './constants';
import { useCreateSpaceMutation } from './hooks/use-mutation/useCreateSpace';
import { IndustryCanvasService } from './services/IndustryCanvasService';

export type UserProfile = {
  userIdentifier: string;
  lastUpdatedTime: number;
  givenName?: string;
  surname?: string;
  email?: string;
  displayName?: string;
  jobTitle?: string;
};

const getUserProfile = async (client: CogniteClient): Promise<UserProfile> => {
  const response = await client.get<UserProfile>(
    `/api/v1/projects/${client.project}/profiles/me`
  );
  return response.data;
};

const useUserProfileQuery = () => {
  const sdk = useSDK();
  return useQuery<UserProfile, HttpError>(
    [QueryKeys.USER_PROFILE],
    async () => await getUserProfile(sdk),
    {
      retry: (failureCount: number, error: HttpError): boolean => {
        // Retry iff we do *not* get a 403. That is if, and only if,
        // we do have access to the Profiles API
        return error.status !== 403;
      },
    }
  );
};

type UserProfileContextType = {
  userProfile: UserProfile;
};

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: {
    userIdentifier: '',
    lastUpdatedTime: Date.now(),
  },
});

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
    data: hasDataModelWriteAcl,
    isLoading: isLoadingHasDataModelWriteAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelsAcl',
    'WRITE',
    undefined,
    {
      enabled: !!context?.flow,
    }
  );

  const {
    data: userProfile,
    isLoading: isLoadingUserProfile,
    error: userProfileError,
  } = useUserProfileQuery();

  const [spaceExists, setSpaceExists] = useState(false);
  const { mutateAsync: createSpace, isLoading: isCreatingSpace } =
    useCreateSpaceMutation();

  // Create the instance space for IC, if it doesn't already exist
  useEffect(() => {
    if (!hasDataModelWriteAcl || spaceExists) {
      return;
    }

    const createSpaceWrapper = async () => {
      await createSpace({
        space: IndustryCanvasService.INSTANCE_SPACE,
        description: 'The Industrial Canvas instance space',
        name: 'Industrial Canvas instance space',
      });
      setSpaceExists(true);
    };
    createSpaceWrapper();
  }, [hasDataModelWriteAcl, spaceExists, setSpaceExists, createSpace]);

  if (
    isLoadingHasDataModelInstancesReadAcl ||
    isLoadingHasDataModelInstancesWriteAcl ||
    isLoadingHasDataModelReadAcl ||
    isLoadingHasDataModelWriteAcl ||
    isLoadingUserProfile ||
    isCreatingSpace
  ) {
    return (
      <LoaderWrapper>
        <Icon type="Loader" />
      </LoaderWrapper>
    );
  }

  const doesNotHaveUserProfileAccess = userProfileError?.status === 403;
  if (
    !hasDataModelInstancesReadAcl ||
    !hasDataModelInstancesWriteAcl ||
    !hasDataModelReadAcl ||
    !hasDataModelWriteAcl ||
    doesNotHaveUserProfileAccess
  ) {
    return <NoAccessPage />;
  }

  if (userProfile === undefined) {
    return <NoAccessPage />;
  }

  if (!spaceExists) {
    return <SpaceDoesNotExistPage />;
  }

  return (
    <UserProfileContext.Provider value={{ userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType =>
  useContext(UserProfileContext);

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
