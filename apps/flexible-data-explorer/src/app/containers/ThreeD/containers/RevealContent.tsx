import { useCallback, useMemo } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  FdmAssetStylingGroup,
  Reveal3DResources,
  useCameraNavigation,
  useClickedNodeData,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

import { PreviewCard } from './PreviewCard';

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
  const clickedNodeData = useClickedNodeData();

  const instanceStyling = useMemo(() => {
    const styling: FdmAssetStylingGroup[] = [];

    if (clickedNodeData !== undefined) {
      styling.push({
        fdmAssetExternalIds: [clickedNodeData.fdmNode],
        style: { cad: DefaultNodeAppearance.Highlighted },
      });
    }

    return styling;
  }, [clickedNodeData?.fdmNode]);

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
        instanceStyling={instanceStyling}
        onResourcesAdded={handleResourcesAdded}
      />
      <PreviewCard nodeData={clickedNodeData} />
    </>
  );
};
