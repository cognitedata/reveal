import React from 'react';

import { isEmpty } from 'lodash';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../../../constants/threeD';
import { useSelectedSiteConfig } from '../../../../hooks/useConfig';
import { useInstanceThreeDEntryQuery } from '../../../../services/instances/generic/hooks/useInstanceThreeD';
import { DataModelV2, Instance } from '../../../../services/types';
import { RevealContent } from '../../../ThreeD/containers/RevealContent';

import { PreviewContainer } from './elements';

interface Props {
  instance?: Instance;
  dataModel?: DataModelV2;
}
export const ThreeDViewer: React.FC<Props> = ({ instance, dataModel }) => {
  const sdk = useSDK();
  const siteConfig = useSelectedSiteConfig();

  const { data, isLoading, isFetched } = useInstanceThreeDEntryQuery(
    instance,
    dataModel
  );

  const modelIdentifiers = siteConfig?.threeDResources;

  if (
    !modelIdentifiers ||
    !instance?.externalId ||
    !instance?.instanceSpace ||
    isLoading ||
    (isFetched && isEmpty(data.items))
  ) {
    return null;
  }

  return (
    <PreviewContainer>
      <RevealContainer
        sdk={sdk}
        color={defaultRevealColor}
        viewerOptions={defaultViewerOptions}
      >
        <RevealContent
          threeDResources={modelIdentifiers}
          instanceExternalId={instance.externalId}
          instanceSpace={instance.instanceSpace}
          hideToolbar
          focusNode
        />
      </RevealContainer>
    </PreviewContainer>
  );
};
