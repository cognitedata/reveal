import { useParams } from 'react-router-dom';

import { Button, BaseWidgetProps, Widget } from '@fdx/components';
import { useInstanceThreeDEntryQuery } from '@fdx/services/instances/generic/hooks/useInstanceThreeD';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '@fdx/shared/constants/threeD';
import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import { useViewModeParams } from '@fdx/shared/hooks/useParams';
import { isEmpty } from 'lodash';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { RevealContent } from '../../ThreeD/modules/RevealContent';

export type ThreeDWidgetProps = BaseWidgetProps;

export const ThreeDWidget: React.FC<ThreeDWidgetProps> = () => {
  const sdk = useSDK();
  const [, setViewMode] = useViewModeParams();
  const { externalId, instanceSpace } = useParams();

  const { data, status, isFetched } = useInstanceThreeDEntryQuery();

  const siteConfig = useSelectedSiteConfig();

  const modelIdentifiers = siteConfig?.threeDResources;

  if (!modelIdentifiers || (isFetched && isEmpty(data.items))) {
    return null;
  }

  return (
    <Widget rows={4} columns={2}>
      <Widget.Header title="3D" type="3D">
        <Button.InternalRedirect
          onClick={() => {
            setViewMode('3d');
          }}
        />
      </Widget.Header>

      <Widget.Body state={status} noPadding>
        <RevealContainer
          sdk={sdk}
          color={defaultRevealColor}
          viewerOptions={defaultViewerOptions}
        >
          <RevealContent
            threeDResources={modelIdentifiers}
            instanceExternalId={externalId}
            instanceSpace={instanceSpace}
            hideToolbar
            disablePreviewCard
            focusNode
          />
        </RevealContainer>
      </Widget.Body>
    </Widget>
  );
};
