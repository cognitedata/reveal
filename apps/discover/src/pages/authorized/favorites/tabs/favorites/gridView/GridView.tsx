import React from 'react';

import styled from 'styled-components/macro';

import { SetCommentTarget } from '@cognite/react-comments';

import { FavoriteSummary } from 'modules/favorite/types';

import { FAVORITE_CARD_CONTAINER } from '../../../constants';
import { ModalType } from '../types';

import FavouriteCard from './Card';

const Container = styled.div`
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
  grid-auto-rows: minmax(100px, auto);
  gap: 40px;
  height: auto;
`;

interface Props {
  sets: FavoriteSummary[];
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  handleNavigateFavoriteSet: (item: FavoriteSummary) => void;
  isOwner: (userId: string) => boolean;
  setCommentTarget: SetCommentTarget;
}

export const GridView: React.FC<Props> = ({
  handleNavigateFavoriteSet,
  handleOpenModal,
  sets,
  setCommentTarget,
  isOwner,
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
            />
          );
        })}
      </Grid>
    </Container>
  );
};

export default GridView;
