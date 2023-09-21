/*!
 * Copyright 2023 Cognite AS
 */

import { PropsWithChildren } from 'react';

import {
  ViewerAnchor,
  withSuppressRevealEvents,
  ClickedNodeData,
} from '@cognite/reveal-react-components';

import { useFDM } from '../../../providers/FDMProvider';
import { InstancePreview } from '../../preview/InstancePreview';

export const PreviewCard = ({
  nodeData,
}: {
  nodeData: ClickedNodeData | undefined;
}) => {
  const fdmClient = useFDM();

  if (
    nodeData === undefined ||
    nodeData.view === undefined ||
    nodeData.fdmNode === undefined
  ) {
    return <></>;
  }

  return (
    <ViewerAnchor
      position={nodeData.intersection.point}
      sticky
      stickyMargin={10}
      style={{ transform: 'translate(100px, -50%)' }}
    >
      <SuppressedDiv>
        <InstancePreview.Generic
          instance={{
            dataType: nodeData.view.externalId,
            instanceSpace: nodeData.fdmNode.space,
            externalId: nodeData.fdmNode.externalId,
          }}
          dataModel={fdmClient.getDataModelByDataType(nodeData.view.externalId)}
          disableViewer
        />
      </SuppressedDiv>
    </ViewerAnchor>
  );
};

const SuppressedDiv = withSuppressRevealEvents(
  ({ children }: PropsWithChildren) => <div>{children}</div>
);
