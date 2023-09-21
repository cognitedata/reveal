import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatTime } from '@cognite/cdf-utilities';
import { Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';
import {
  Image360SiteData,
  Revision3DWithIndex,
  use3DRevisionsQuery,
} from '@data-exploration-lib/domain-layer';

import { ThreeDContext } from '../../contexts/ThreeDContext';
import { getStateUrl } from '../../utils';

export const MainThreeDModelMenuItem = ({
  model,
  revision,
}: {
  model?: Model3D;
  image360SiteData?: Image360SiteData;
  revision?: Revision3DWithIndex;
}) => {
  const { t } = useTranslation();
  const {
    viewState,
    assetDetailsExpanded,
    selectedAssetId,
    secondaryModels,
    images360,
    slicingState,
    assetHighlightMode,
    pointsOfInterest,
  } = useContext(ThreeDContext);

  const { data: revisions = [], isFetching } = use3DRevisionsQuery(model?.id);

  const navigate = useNavigate();

  if (!model) {
    return (
      <Menu>
        <Menu.Header>
          {t('NO_REVISIONS_AVAILABLE', 'No revisions available')}
        </Menu.Header>
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
              ? t('PUBLISHED', 'Published')
              : t(
                  'CREATED_WITH_TIME',
                  `Created: ${formatTime(createdTime.getTime())}`,
                  {
                    time: formatTime(createdTime.getTime()),
                  }
                )
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
                  pointsOfInterest,
                  images360,
                  assetHighlightMode,
                })
              );
            }
          }}
        >
          {t('REVISION_WITH_INDEX', `Revision ${index}`, {
            index,
          })}
        </Menu.Item>
      ))}
    </Menu>
  );
};
