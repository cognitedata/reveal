/*!
 * Copyright 2023 Cognite AS
 */

import { PropsWithChildren } from 'react';

import { useFDM } from '@fdx/shared/providers/FDMProvider';

import {
  ViewerAnchor,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { InstancePreview } from '../../preview/InstancePreview';

import { InstanceWithPosition } from './RevealContent';

export const PreviewCard = ({
  nodeData,
}: {
  nodeData: InstanceWithPosition | undefined;
}) => {
  const fdmClient = useFDM();

  if (
    nodeData === undefined ||
    nodeData.dataType === undefined ||
    nodeData.externalId === undefined
  ) {
    return <></>;
  }

  return (
    <ViewerAnchor
      position={nodeData.threeDPosition}
      sticky
      stickyMargin={10}
      style={{ transform: 'translate(100px, -50%)' }}
    >
      <SuppressedDiv>
        <InstancePreview.Generic
          instance={nodeData}
          dataModel={fdmClient.getDataModelByDataType(nodeData.dataType)}
          disableViewer
        />
      </SuppressedDiv>
    </ViewerAnchor>
  );
};

const SuppressedDiv = withSuppressRevealEvents(
  ({ children }: PropsWithChildren) => <div>{children}</div>
);
