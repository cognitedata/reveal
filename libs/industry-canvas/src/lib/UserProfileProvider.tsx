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

// TODO(marvin): Uncomment space auto-creation once system data models are working
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
  } = useUserProfile();

  /*
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
  */

  if (
    isLoadingHasDataModelInstancesReadAcl ||
    isLoadingHasDataModelInstancesWriteAcl ||
    isLoadingHasDataModelReadAcl ||
    isLoadingHasDataModelWriteAcl ||
    isLoadingUserProfile
    // || isCreatingSpace
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

  /*
  if (!spaceExists) {
    return <SpaceDoesNotExistPage />;
  }
  */

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
