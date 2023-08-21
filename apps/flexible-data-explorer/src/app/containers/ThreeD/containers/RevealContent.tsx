import { useCallback, useMemo, useState } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  FdmAssetStylingGroup,
  Reveal3DResources,
  useCameraNavigation,
  useClickedNodeData,
  Image360Details,
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
  const [resourceMounted, setResourcesMounted] = useState(false);

  const instanceStyling = useMemo(() => {
    const styling: FdmAssetStylingGroup[] = [];

    if (clickedNodeData?.fdmNode !== undefined) {
      styling.push({
        fdmAssetExternalIds: [clickedNodeData.fdmNode],
        style: { cad: DefaultNodeAppearance.Highlighted },
      });
    }

    return styling;
  }, [clickedNodeData?.fdmNode]);

  const handleResourcesAdded = useCallback(() => {
    setResourcesMounted(true);
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
      {resourceMounted && <Image360Details />}
      <PreviewCard nodeData={clickedNodeData} />
    </>
  );
};
