import { useFavoritesCreateMutate } from 'domain/favorites/internal/actions/useFavoritesMutate';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { NOTIFICATION_MESSAGE } from 'components/AddToFavoriteSetMenu/constants';
import { showSuccessMessage } from 'components/Toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import {
  hideCreateFavoriteModal,
  setItemsToAddOnFavoriteCreation,
} from 'modules/favorite/reducer';
import {
  useIsCreateFavoriteModalOpenSelector,
  useItemsToAddOnFavoriteCreationSelector,
} from 'modules/favorite/selectors';

import { CREATE_SET_MODAL_BUTTON_TEXT } from '../../constants';
import BaseFavoriteCreationModal from '../baseFavoriteCreationModal/BaseFavoriteCreationModal';

const CreateFavoriteSetModal: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const metrics = useGlobalMetrics('favorites');
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { mutateAsync: mutateCreateFavourite } = useFavoritesCreateMutate();

  const isCreateModalOpen = useIsCreateFavoriteModalOpenSelector();
  const itemsToAddAfterFavoriteCreation =
    useItemsToAddOnFavoriteCreationSelector();

  useEffect(() => {
    if (!isCreateModalOpen) {
      clearState();
    }
  }, [isCreateModalOpen]);

  const handleTextChanged = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value } = event.target;

    if (field === 'name') setName(value);
    else if (field === 'description') setDescription(value);
  };

  const clearState = () => {
    setName('');
    setDescription('');
    dispatch(setItemsToAddOnFavoriteCreation(undefined));
  };

  const handleOnConfirm = () => {
    metrics.track('click-confirm-create-set-button');
    createFavorite();
  };

  const createFavorite = () => {
    const content = {
      documentIds: itemsToAddAfterFavoriteCreation?.documentIds,
      wells: itemsToAddAfterFavoriteCreation?.wells,
    };

    mutateCreateFavourite({
      name: name.trim(),
      description: description?.trim() || undefined,
      content,
    }).then(() => {
      showSuccessMessage('Favorite set created');
      if (itemsToAddAfterFavoriteCreation) {
        showSuccessMessage(t(NOTIFICATION_MESSAGE));
      }
    });

    dispatch(hideCreateFavoriteModal());
    clearState();
  };

  const handleOnClose = () => {
    metrics.track('click-cancel-create-set-button');

    clearState();
    dispatch(hideCreateFavoriteModal());
  };

  return (
    <BaseFavoriteCreationModal
      isOpen={isCreateModalOpen}
      title={t('Create new set')}
      okText={t(CREATE_SET_MODAL_BUTTON_TEXT)}
      name={name}
      description={description}
      handleOnConfirm={handleOnConfirm}
      handleTextChanged={handleTextChanged}
      handleOnClose={handleOnClose}
      // showShareOptions={false}
    />
  );
};

export default CreateFavoriteSetModal;
