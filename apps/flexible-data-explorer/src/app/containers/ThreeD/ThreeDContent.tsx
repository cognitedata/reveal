import { Color } from 'three';

import {
  CogniteCadModelContainer,
  RevealContainer,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { type ModelIdentifier } from '../../../config/types';
import { useProjectConfig } from '../../hooks/useProjectConfig';

export const ThreeDContent = () => {
  const sdk = useSDK();
  return (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4b)}>
      <CadModels />
    </RevealContainer>
  );
};

const CadModels: React.FC = () => {
  const projectConfigs = useProjectConfig();
  const modelIdentifiers = projectConfigs
    .filter(
      (config) =>
        config.threeDResources !== undefined &&
        config.threeDResources.length > 0
    )
    .flatMap((config) => config.threeDResources)
    .filter(
      (resource): resource is ModelIdentifier =>
        (resource as ModelIdentifier).modelId !== undefined &&
        (resource as ModelIdentifier).type === 'cad'
    );

  return (
    <>
      {modelIdentifiers.map(({ modelId, revisionId }) => (
        <CogniteCadModelContainer addModelOptions={{ modelId, revisionId }} />
      ))}
    </>
  );
};
