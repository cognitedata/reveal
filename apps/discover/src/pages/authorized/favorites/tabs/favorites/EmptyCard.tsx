import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import EmptyState from 'components/emptyState';
import InlineLink from 'components/inlineLink';
import navigation from 'constants/navigation';
import { showCreateFavoriteModal } from 'modules/favorite/reducer';

interface Props {
  isLoading: boolean;
}
export const EmptyCard: React.FC<Props> = ({ isLoading }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Favorites');

  const dispatchOnCreateModalOpen = () => dispatch(showCreateFavoriteModal());

  return (
    <EmptyState img="Favorites" isLoading={isLoading}>
      {t('Start by')}{' '}
      <InlineLink href={navigation.SEARCH_DOCUMENTS}>
        {t('searching')}
      </InlineLink>{' '}
      {t('or')}{' '}
      <InlineLink onClick={dispatchOnCreateModalOpen}>
        {t('create a set')}
      </InlineLink>{' '}
      {t('to get started')}
    </EmptyState>
  );
};
