import React from 'react';

import { useInstanceThreeDEntryQuery } from '@fdx/services/instances/generic/hooks/useInstanceThreeD';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '@fdx/shared/constants/threeD';
import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import { DataModelV2, Instance } from '@fdx/shared/types/services';
import { isEmpty } from 'lodash';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { RevealContent } from '../../../ThreeD/modules/RevealContent';

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
          disablePreviewCard
          focusNode
        />
      </RevealContainer>
    </PreviewContainer>
  );
};
