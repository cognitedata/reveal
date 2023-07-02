import { Color, Matrix4 } from 'three';

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

  const modelIdentifiers = projectConfigs?.threeDResources as ModelIdentifier[];

  if (!modelIdentifiers) {
    return null;
  }

  return (
    <>
      {modelIdentifiers.map(({ modelId, revisionId, transform }) => (
        <CogniteCadModelContainer
          addModelOptions={{ modelId, revisionId }}
          transform={new Matrix4().makeTranslation(
            transform?.x ?? 0,
            transform?.y ?? 0,
            transform?.z ?? 0
          )}
        />
      ))}
    </>
  );
};
