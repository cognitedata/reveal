import { type ReactNode } from 'react';
import { type CommonResourceContainerProps } from '../Reveal3DResources/types';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';
import { Reveal3DResources } from '../Reveal3DResources/Reveal3DResources';
import { useLoadPoisForScene } from '../Architecture/pointsOfInterest/useLoadPoisForScene';

export type SceneContainerProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
} & CommonResourceContainerProps;

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  ...rest
}: SceneContainerProps): ReactNode {
  const resourceOptions = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);

  useGroundPlaneFromScene(sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sceneExternalId, sceneSpaceId);
  useLoadPoisForScene(sceneExternalId, sceneSpaceId);

  return resourceOptions.length > 0 && <Reveal3DResources resources={resourceOptions} {...rest} />;
}
