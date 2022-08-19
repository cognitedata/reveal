import * as React from 'react';
import { useDispatch } from 'react-redux';

import EmptyState from 'components/EmptyState';
import InlineLink from 'components/InlineLink';
import navigation from 'constants/navigation';
import { useTranslation } from 'hooks/useTranslation';
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
