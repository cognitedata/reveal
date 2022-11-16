import React from 'react';

import { Body, Colors, Detail, Flex, Label, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import ThreeDTimestamp from 'app/containers/ThreeD/timestamp/ThreeDTimestamp';
import { Revision3DWithIndex, useRevisions } from 'app/containers/ThreeD/hooks';

export const MainThreeDModelMenuItem = ({
  model,
  revision,
}: {
  model: Model3D;
  revision: Revision3DWithIndex;
}) => {
  const { data: revisions } = useRevisions(model.id);

  const selectedRevision = revisions?.find(({ id }) => id === revision.id);

  return (
    <Menu.Item appendIcon="Checkmark" disabled>
      <StyledMainThreeDModelMenuItemContent
        justifyContent="space-between"
        gap={16}
      >
        <Flex alignItems="flex-start" direction="column">
          <StyledMainThreeDModelName level={2}>
            {model.name}
          </StyledMainThreeDModelName>
          <StyledMainThreeDModelDetail>
            Created:{' '}
            <ThreeDTimestamp
              timestamp={selectedRevision?.createdTime.getTime()}
            />
          </StyledMainThreeDModelDetail>
        </Flex>
        <Flex justifyContent="center" direction="column">
          <StyledMainThreeDModelRevisionLabel size="small" variant="unknown">
            Revision {selectedRevision?.index}
          </StyledMainThreeDModelRevisionLabel>
        </Flex>
      </StyledMainThreeDModelMenuItemContent>
    </Menu.Item>
  );
};

const StyledMainThreeDModelName = styled(Body).attrs({
  level: 2,
  strong: true,
})`
  color: ${Colors['text-icon--interactive--disabled']};
`;

const StyledMainThreeDModelDetail = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled']};
`;

const StyledMainThreeDModelRevisionLabel = styled(Label)`
  color: ${Colors['text-icon--interactive--disabled']};
  margin-right: 8px;
`;

const StyledMainThreeDModelMenuItemContent = styled(Flex)`
  width: 100%;
`;
