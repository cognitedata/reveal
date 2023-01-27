import React, { useContext } from 'react';

import { Body, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import {
  Image360SiteData,
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
import {
  getMainModelSubtitle,
  getMainModelTitle,
  getStateUrl,
} from '@data-exploration-app/containers/ThreeD/utils';
import { useNavigate } from 'react-router-dom';

export const MainThreeDModelMenuItem = ({
  model,
  image360SiteData,
  revision,
}: {
  model?: Model3D;
  image360SiteData?: Image360SiteData;
  revision?: Revision3DWithIndex;
}) => {
  const {
    viewState,
    assetDetailsExpanded,
    selectedAssetId,
    secondaryModels,
    images360,
    slicingState,
    assetHighlightMode,
  } = useContext(ThreeDContext);

  const { data: revisions = [], isFetched } = useRevisions(model?.id);

  const navigate = useNavigate();

  const menuItemContent = (
    <Flex alignItems="flex-start" direction="column">
      <Body level={2} strong>
        {getMainModelTitle(model, image360SiteData)}
      </Body>
      <StyledMainThreeDModelDetail>
        <>{getMainModelSubtitle(!!image360SiteData, revision)}</>
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
              $isSelected={id === revision?.id}
              appendIcon={id === revision?.id ? 'Checkmark' : undefined}
              key={id}
              onClick={() => {
                if (id !== revision?.id) {
                  navigate(
                    getStateUrl({
                      revisionId: id,
                      viewState,
                      slicingState,
                      selectedAssetId,
                      assetDetailsExpanded,
                      secondaryModels,
                      images360,
                      assetHighlightMode,
                    })
                  );
                }
              }}
            >
              <StyledMenuItemContent alignItems="flex-start" direction="column">
                <StyledSecondaryThreeDModelBody
                  $isSelected={id === revision?.id}
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
