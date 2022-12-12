import React, { useContext } from 'react';

import { Body, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import {
  Revision3DWithIndex,
  useRevisions,
} from '@data-exploration-app/containers/ThreeD/hooks';
import {
  StyledSecondaryThreeDModelDetail,
  StyledMenuItemContent,
  StyledRevisionMenuItem,
  StyledSecondaryThreeDModelBody,
} from '@data-exploration-app/containers/ThreeD/title/SecondaryThreeDModelMenuItem';
import ThreeDTimestamp from '@data-exploration-app/containers/ThreeD/timestamp/ThreeDTimestamp';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { getStateUrl } from '@data-exploration-app/containers/ThreeD/utils';
import { useNavigate } from 'react-router-dom';

export const MainThreeDModelMenuItem = ({
  model,
  revision,
}: {
  model: Model3D;
  revision: Revision3DWithIndex;
}) => {
  const { viewState, assetDetailsExpanded, selectedAssetId, secondaryModels } =
    useContext(ThreeDContext);

  const { data: revisions = [], isFetched } = useRevisions(model.id);

  const navigate = useNavigate();

  const menuItemContent = (
    <Flex alignItems="flex-start" direction="column">
      <Body level={2} strong>
        {model.name}
      </Body>
      <StyledMainThreeDModelDetail>
        <>
          {`Revision ${revision.index} - ${
            revision.published ? 'Published' : 'Unpublished'
          }`}
        </>
      </StyledMainThreeDModelDetail>
    </Flex>
  );

  if (!isFetched || revisions?.length === 0) {
    return (
      <Menu.Item appendIcon={!isFetched ? 'Loader' : undefined}>
        {menuItemContent}
      </Menu.Item>
    );
  }

  return (
    <Menu.Submenu
      content={
        <Menu>
          {revisions?.map(({ createdTime, id, index, published }) => (
            <StyledRevisionMenuItem
              $isSelected={id === revision.id}
              appendIcon={id === revision.id ? 'Checkmark' : undefined}
              key={id}
              onClick={() => {
                if (id !== revision.id) {
                  navigate(
                    getStateUrl({
                      revisionId: id,
                      viewState,
                      selectedAssetId,
                      assetDetailsExpanded,
                      secondaryModels,
                    })
                  );
                }
              }}
            >
              <StyledMenuItemContent alignItems="flex-start" direction="column">
                <StyledSecondaryThreeDModelBody
                  $isSelected={id === revision.id}
                >
                  Revision {index}
                </StyledSecondaryThreeDModelBody>
                <StyledSecondaryThreeDModelDetail>
                  {published ? (
                    'Published'
                  ) : (
                    <>
                      Created:{' '}
                      <ThreeDTimestamp timestamp={createdTime.getTime()} />
                    </>
                  )}
                </StyledSecondaryThreeDModelDetail>
              </StyledMenuItemContent>
            </StyledRevisionMenuItem>
          ))}
        </Menu>
      }
    >
      {menuItemContent}
    </Menu.Submenu>
  );
};

const StyledMainThreeDModelDetail = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled']};
`;
