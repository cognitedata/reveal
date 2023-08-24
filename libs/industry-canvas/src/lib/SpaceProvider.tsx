import { createContext, useContext } from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

import { AppContext } from '@data-exploration-lib/core';

import { NoAccessPage } from './components/NoAccessPage';
import { SetupIndustrialCanvasPage } from './components/SetupIndustrialCanvasPage';
import {
  SpaceCreateDefinition,
  useCreateSpaceMutation,
} from './hooks/use-mutation/useCreateSpace';
import { useListSpaces } from './hooks/use-query/useListSpaces';
import { usePermissions } from './hooks/usePermissions';
import { CommentService } from './services/comments/CommentService';
import { IndustryCanvasService } from './services/IndustryCanvasService';

const SpaceContext = createContext({});

export const ALL_REQUIRED_SCOPES = [
  IndustryCanvasService.SYSTEM_SPACE,
  CommentService.SYSTEM_SPACE,
  IndustryCanvasService.INSTANCE_SPACE,
  CommentService.INSTANCE_SPACE,
];

type SpaceProviderProps = {
  spaceDefinition: SpaceCreateDefinition;
  requiredReadScopes?: string[]; // If requiredScopes is undefined then 'all' scope is used
  requiredDatamodelWriteScopes?: string[];
  children?: React.ReactNode;
};

export const SpaceProvider: React.FC<SpaceProviderProps> = ({
  children,
  spaceDefinition,
  requiredReadScopes,
  requiredDatamodelWriteScopes,
}) => {
  const context = useContext(AppContext);
  const scope =
    requiredReadScopes !== undefined
      ? { spaceIdScope: { spaceIds: requiredReadScopes } }
      : undefined;
  const writeDataModelScope =
    requiredDatamodelWriteScopes !== undefined
      ? { spaceIdScope: { spaceIds: requiredDatamodelWriteScopes } }
      : undefined;

  const { data: hasDataModelReadAcl, isLoading: isLoadingHasDataModelReadAcl } =
    usePermissions(context?.flow as any, 'dataModelsAcl', 'READ', scope, {
      enabled: !!context?.flow,
    });

  const {
    data: hasDataModelWriteAcl,
    isLoading: isLoadingHasDataModelWriteAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelsAcl',
    'WRITE',
    writeDataModelScope,
    { enabled: !!context?.flow }
  );

  const {
    data: hasDataModelInstancesReadAcl,
    isLoading: isLoadingHasDataModelInstancesReadAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelInstancesAcl',
    'READ',
    scope,
    { enabled: !!context?.flow }
  );

  const {
    data: hasDataModelInstancesWriteAcl,
    isLoading: isLoadingHasDataModelInstancesWriteAcl,
  } = usePermissions(
    context?.flow as any,
    'dataModelInstancesAcl',
    'WRITE',
    scope,
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
        requiredScopes={ALL_REQUIRED_SCOPES}
      />
    );
  }

  const instanceSpace = spaces?.find(
    ({ space }) => space === spaceDefinition.space
  );
  if (instanceSpace === undefined || isCreatingSpace) {
    return (
      <SetupIndustrialCanvasPage
        hasDataModelWriteAcl={hasDataModelWriteAcl}
        createSpace={createSpace}
        spaceDefinition={spaceDefinition}
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
