import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Image360SiteData } from '@data-exploration-app/containers/ThreeD/hooks';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import {
  getMainModelSubtitle,
  getMainModelTitle,
  getStateUrl,
} from '@data-exploration-app/containers/ThreeD/utils';
import {
  Revision3DWithIndex,
  use3DRevisionsQuery,
} from '@data-exploration-lib/domain-layer';

import { formatTime } from '@cognite/cdf-utilities';
import { Body, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

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

  const { data: revisions = [], isFetched } = use3DRevisionsQuery(model?.id);

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
      <Menu.Item css={{}} icon={!isFetched ? 'Loader' : undefined}>
        {menuItemContent}
      </Menu.Item>
    );
  }

  return (
    <Menu.Submenu
      content={
        <Menu>
          {revisions?.map(({ createdTime, id, index, published }) => (
            <Menu.Item
              toggled={id === revision?.id}
              description={
                published
                  ? 'Published'
                  : `Created: ${formatTime(createdTime.getTime())}`
              }
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
              Revision {index}
            </Menu.Item>
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
