import { createContext, useContext } from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { AppContext } from '@data-exploration-lib/core';

import { NoAccessPage } from './components/NoAccessPage';
import { SetupIndustrialCanvasPage } from './components/SetupIndustrialCanvasPage';
import { useCreateSpaceMutation } from './hooks/use-mutation/useCreateSpace';
import { useListSpaces } from './hooks/use-query/useListSpaces';
import { IndustryCanvasService } from './services/IndustryCanvasService';

const SpaceContext = createContext({});

export const SpaceProvider = ({ children }: { children: JSX.Element }) => {
  const context = useContext(AppContext);

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

  const { mutateAsync: createSpace, isLoading: isCreatingSpace } =
    useCreateSpaceMutation();
  const { data: spaces, isLoading: isListingSpaces } = useListSpaces();

  if (
    isLoadingHasDataModelInstancesReadAcl ||
    isLoadingHasDataModelInstancesWriteAcl ||
    isLoadingHasDataModelReadAcl ||
    isLoadingHasDataModelWriteAcl ||
    isListingSpaces
  ) {
    return (
      <LoaderWrapper>
        <Icon type="Loader" />
      </LoaderWrapper>
    );
  }

  // NOTE: datamodels:write is only required when creating the instance space,
  // which is why we do not show the NoAccessPage when the user does not have
  // that capability
  if (
    !hasDataModelReadAcl ||
    !hasDataModelInstancesReadAcl ||
    !hasDataModelInstancesWriteAcl
  ) {
    return (
      <NoAccessPage
        hasDataModelReadAcl={hasDataModelReadAcl}
        hasDataModelInstancesReadAcl={hasDataModelInstancesReadAcl}
        hasDataModelInstancesWrite={hasDataModelInstancesWriteAcl}
      />
    );
  }

  const instanceSpace = spaces?.find(
    ({ space }) => space === IndustryCanvasService.INSTANCE_SPACE
  );
  if (instanceSpace === undefined || isCreatingSpace) {
    return (
      <SetupIndustrialCanvasPage
        hasDataModelWriteAcl={hasDataModelWriteAcl}
        onCreateSpace={() =>
          createSpace({
            space: IndustryCanvasService.INSTANCE_SPACE,
            description: 'The Industrial Canvas instance space',
            name: 'Industrial Canvas instance space',
          })
        }
        isCreatingSpace={isCreatingSpace}
      />
    );
  }
  return <SpaceContext.Provider value={{}}>{children}</SpaceContext.Provider>;
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
