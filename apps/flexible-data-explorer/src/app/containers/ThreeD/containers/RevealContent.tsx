import { useCallback } from 'react';

import {
  AddResourceOptions,
  Reveal3DResources,
  useCameraNavigation,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

interface Props {
  modelIdentifiers: AddResourceOptions[];
  externalId?: string;
  instanceSpace?: string;
  fitCamera?: 'models' | 'instance';
  hideToolbar?: boolean;
}
export const RevealContent = ({
  modelIdentifiers,
  externalId,
  instanceSpace,
  fitCamera,
  hideToolbar,
}: Props) => {
  const cameraNavigation = useCameraNavigation();

  const handleResourcesAdded = useCallback(() => {
    if (fitCamera === 'models') {
      return cameraNavigation.fitCameraToAllModels();
    }

    if (fitCamera === 'instance') {
      if (externalId && instanceSpace) {
        cameraNavigation.fitCameraToInstance(externalId, instanceSpace);
      }
    }
  }, [cameraNavigation, externalId, instanceSpace, fitCamera]);

  return (
    <>
      {!hideToolbar && <StyledRevealToolBar />}
      <Reveal3DResources
        resources={modelIdentifiers}
        defaultResourceStyling={defaultResourceStyling}
        onResourcesAdded={handleResourcesAdded}
      />
    </>
  );
};
