import React from 'react';

import { SetCommentTarget } from '@cognite/react-comments';

import { FavoriteSummary } from 'modules/favorite/types';

import { FAVORITE_CARD_CONTAINER } from '../../../constants';
import { Container, Grid } from '../elements';
import { ModalType } from '../types';

import FavouriteCard from './Card';

interface Props {
  sets: FavoriteSummary[];
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  handleNavigateFavoriteSet: (item: FavoriteSummary) => void;
  isOwner: (userId: string) => boolean;
  setCommentTarget: SetCommentTarget;
  viewMode: string;
}

export const GridView: React.FC<Props> = ({
  handleNavigateFavoriteSet,
  handleOpenModal,
  sets,
  setCommentTarget,
  isOwner,
  viewMode,
}) => {
  return (
    <Container>
      <Grid data-testid={FAVORITE_CARD_CONTAINER}>
        {sets.map((favorite) => {
          return (
            <FavouriteCard
              key={favorite.id}
              favorite={favorite}
              isFavoriteSetOwner={isOwner(favorite.owner.id)}
              onClick={handleNavigateFavoriteSet}
              handleOpenModal={handleOpenModal}
              setCommentTarget={setCommentTarget}
              viewMode={viewMode}
            />
          );
        })}
      </Grid>
    </Container>
  );
};

export default GridView;
