import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { SetCommentTarget } from '@cognite/react-comments';

import { shortDate } from '_helpers/date';
import { Card } from 'components/card';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteSummary } from 'modules/favorite/types';
import { getFavoriteLastUpdateByUserName } from 'modules/favorite/utils';
import { getFullNameOrDefaultText } from 'modules/user/utils';
import { FlexColumn, FlexRow, FlexAlignItems } from 'styles/layout';
import { useTheme } from 'styles/useTheme';

import {
  FAVORITE_SET_EMPTY,
  FAVORITE_SET_INFO_ASSETS,
  FAVORITE_SET_INFO_CREATED_BY,
  FAVORITE_SET_INFO_DESCRIPTION,
  FAVORITE_SET_INFO_UPDATED_BY,
} from '../../../constants';
import Actions from '../Actions';
import { ModalType } from '../types';

const StyledCard = styled(Card)`
  min-height: 258px;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);

  &:hover {
    box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%),
      0px 5px 8px 0px rgb(0 0 0 / 14%), 0px 1px 14px 0px rgb(0 0 0 / 12%);
  }
`;
const Content = styled.div``;

const ContentRow = styled(FlexRow)`
  padding: 12px 0;
`;

const Label = styled(FlexAlignItems)`
  font-size: 10px;
  min-width: 100px;
  font-weight: 600;
  align-items: flex-start;
  color: var(--cogs-greyscale-grey6);
  position: relative;
  top: 4px;
`;

const Value = styled(FlexAlignItems)`
  font-size: 14px;
  line-height: 20px;
  color: var(--cogs-greyscale-grey8);
`;

export interface Props {
  favorite: FavoriteSummary;
  onClick: (favorite: FavoriteSummary) => void;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  isFavoriteSetOwner: boolean;
  setCommentTarget: SetCommentTarget;
}

export const FavouriteCard: React.FC<Props> = ({
  favorite,
  onClick,
  setCommentTarget,
  handleOpenModal,
  isFavoriteSetOwner,
}) => {
  const metrics = useGlobalMetrics('favorites');
  const theme = useTheme();
  const { t } = useTranslation('Favorites');

  const handleOnClick = () => {
    onClick(favorite!);
    metrics.track('click-favorite-set-card');
  };
  return (
    <StyledCard
      loading={!favorite}
      data-testid={`favorite-card-${favorite?.name}`}
      avatarText={favorite?.name}
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
          />
        )
      }
    >
      <Content data-testid="favourite-card">
        <FlexColumn>
          <ContentRow>
            <Label theme={theme}>{t(FAVORITE_SET_INFO_DESCRIPTION)}</Label>
            <Value>{favorite?.description || '-'}</Value>
          </ContentRow>
          <ContentRow>
            <Label theme={theme}>{t(FAVORITE_SET_INFO_CREATED_BY)}</Label>
            <Value>
              {`${getFullNameOrDefaultText(favorite.owner)} on ${shortDate(
                favorite?.createdTime
              )}`}
            </Value>
          </ContentRow>
          <ContentRow>
            <Label theme={theme}>{t(FAVORITE_SET_INFO_UPDATED_BY)}</Label>
            <Value>
              {`${getFavoriteLastUpdateByUserName(
                favorite.lastUpdatedBy
              )} on ${shortDate(favorite?.lastUpdatedTime)}`}
            </Value>
          </ContentRow>
          <ContentRow>
            <Label theme={theme}>{t(FAVORITE_SET_INFO_ASSETS)}</Label>
            <Value>{favorite.assetCount || FAVORITE_SET_EMPTY}</Value>
          </ContentRow>
        </FlexColumn>
      </Content>
    </StyledCard>
  );
};

export default FavouriteCard;
