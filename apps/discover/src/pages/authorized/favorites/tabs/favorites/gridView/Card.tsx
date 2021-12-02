import React from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@cognite/cogs.js';
import { SetCommentTarget } from '@cognite/react-comments';

import MetadataTable from 'components/metadataTable';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteSummary } from 'modules/favorite/types';
import {
  getFavoriteLastUpdateByUserName,
  getFavoriteLastUpdatedByDateTime,
} from 'modules/favorite/utils';
import { getFullNameOrDefaultText } from 'modules/user/utils';

import {
  FAVORITE_SET_INFO_ASSETS,
  FAVORITE_SET_INFO_CREATED_BY,
  FAVORITE_SET_INFO_DATE_CREATED,
  FAVORITE_SET_INFO_DATE_UPDATED,
  FAVORITE_SET_INFO_DESCRIPTION,
  FAVORITE_SET_INFO_UPDATED_BY,
  EMPTY_DESCRIPTION_MESSAGE,
} from '../../../constants';
import Actions from '../Actions';
import { StyledCard, LabelDescription, DescriptionField } from '../elements';
import { ModalType } from '../types';

import { AssetLabel } from './AssetLabel';

export interface Props {
  favorite: FavoriteSummary;
  onClick: (favorite: FavoriteSummary) => void;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  isFavoriteSetOwner: boolean;
  setCommentTarget: SetCommentTarget;
  viewMode: string;
}

export const FavouriteCard: React.FC<Props> = ({
  favorite,
  onClick,
  setCommentTarget,
  handleOpenModal,
  isFavoriteSetOwner,
  viewMode,
}) => {
  const metrics = useGlobalMetrics('favorites');
  const { t } = useTranslation('Favorites');

  const handleOnClick = () => {
    onClick(favorite!);
    metrics.track('click-favorite-set-card');
  };

  const labelList = [
    {
      type: 'Document',
      value: favorite.content.documentIds.length,
      titleType: 'Document',
    },
    {
      type: 'OilPlatform',
      value: Object.keys(favorite.content.wells).length,
      titleType: 'Well',
    },
    {
      type: 'Cube',
      value: favorite.content.seismicIds.length,
      titleType: 'Seismic',
    },
  ];

  return (
    <StyledCard
      data-testid={`favorite-card-${favorite?.name}`}
      text={favorite?.name}
      clickHandler={handleOnClick}
      title={favorite?.name}
      settings={
        favorite && (
          <Actions
            set={favorite}
            handleComment={() =>
              setCommentTarget({
                id: favorite.id,
                targetType: COMMENT_NAMESPACE.favorite,
              })
            }
            handleOpenModal={handleOpenModal}
            showEditButton={isFavoriteSetOwner}
            showDeleteButton={isFavoriteSetOwner}
            showShareButton={isFavoriteSetOwner}
            viewMode={viewMode}
          />
        )
      }
    >
      <div data-testid="favourite-card">
        <LabelDescription>{t(FAVORITE_SET_INFO_DESCRIPTION)}</LabelDescription>
        <DescriptionField>
          <Input
            disabled
            placeholder={EMPTY_DESCRIPTION_MESSAGE}
            value={favorite?.description}
            size="small"
            variant="noBorder"
            fullWidth
          />
        </DescriptionField>

        <MetadataTable
          columns={3}
          metadata={[
            {
              label: t(FAVORITE_SET_INFO_DATE_CREATED),
              value: favorite?.createdTime,
              type: 'date',
            },
            {
              label: t(FAVORITE_SET_INFO_CREATED_BY),
              value: getFullNameOrDefaultText(favorite.owner),
            },
            {
              label: t(FAVORITE_SET_INFO_ASSETS),
              value: labelList
                .filter((item) => item.value > 0)
                .map((item) => {
                  return (
                    <AssetLabel
                      key={item.type}
                      type={item.type}
                      value={item.value}
                      titleType={item.titleType}
                    />
                  );
                }),
              type: 'componentlist',
            },
            {
              label: t(FAVORITE_SET_INFO_DATE_UPDATED),
              value: getFavoriteLastUpdatedByDateTime(favorite.lastUpdatedBy),
              type: 'date',
            },
            {
              label: t(FAVORITE_SET_INFO_UPDATED_BY),
              value: getFavoriteLastUpdateByUserName(favorite.lastUpdatedBy),
            },
          ]}
        />
      </div>
    </StyledCard>
  );
};

export default FavouriteCard;
