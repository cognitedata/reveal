/*!
 * Copyright 2023 Cognite AS
 */

import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import {
  ViewerAnchor,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';
import { ClickedNodeData } from '@cognite/reveal-react-components/dist/hooks/useClickedNode';

import { useFDM } from '../../../providers/FDMProvider';
import { InstancePreview } from '../../preview/InstancePreview';

export const PreviewCard = ({
  nodeData,
}: {
  nodeData: ClickedNodeData | undefined;
}) => {
  const fdmClient = useFDM();

  if (nodeData === undefined) {
    return <></>;
  }

  return (
    <ViewerAnchor position={nodeData.intersection.point}>
      <OffsetAnchor>
        <SuppressedDiv>
          <InstancePreview.Generic
            instance={{
              dataType: nodeData.view.externalId,
              instanceSpace: nodeData.fdmNode.space,
              externalId: nodeData.fdmNode.externalId,
            }}
            dataModel={fdmClient.getDataModelByDataType(
              nodeData.view.externalId
            )}
            disableViewer
          />
        </SuppressedDiv>
      </OffsetAnchor>
    </ViewerAnchor>
  );
};

const SuppressedDiv = withSuppressRevealEvents(
  ({ children }: PropsWithChildren) => <div>{children}</div>
);

const OffsetAnchor = styled.div`
  transform: translate(100px, -50%);
`;
