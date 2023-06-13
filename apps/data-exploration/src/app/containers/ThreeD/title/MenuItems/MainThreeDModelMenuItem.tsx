import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatTime } from '@cognite/cdf-utilities';
import { Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/contexts/ThreeDContext';
import { Image360SiteData } from '@data-exploration-app/containers/ThreeD/hooks';
import { getStateUrl } from '@data-exploration-app/containers/ThreeD/utils';
import {
  Revision3DWithIndex,
  use3DRevisionsQuery,
} from '@data-exploration-lib/domain-layer';

export const MainThreeDModelMenuItem = ({
  model,
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

  const { data: revisions = [], isFetching } = use3DRevisionsQuery(model?.id);

  const navigate = useNavigate();

  if (!model) {
    return (
      <Menu>
        <Menu.Header>No revisions available</Menu.Header>
      </Menu>
    );
  }

  return (
    <Menu loading={isFetching}>
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
  );
};
