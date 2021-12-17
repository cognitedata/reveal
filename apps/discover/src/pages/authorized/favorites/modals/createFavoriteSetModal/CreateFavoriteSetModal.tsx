import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { reportException } from '@cognite/react-errors';

import { NOTIFICATION_MESSAGE } from 'components/add-to-favorite-set-menu/constants';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  useFavoritesCreateMutate,
  useFavoriteUpdateContent,
} from 'modules/api/favorites/useFavoritesQuery';
import {
  hideCreateFavoriteModal,
  setItemsToAddAfterFavoriteIsCreated,
} from 'modules/favorite/reducer';

import {
  useIsCreateFavoriteModalOpenSelector,
  useItemsToAddAfterFavoriteCreationSelector,
} from '../../../../../modules/favorite/selectors';
import { CREATE_SET_MODAL_BUTTON_TEXT } from '../../constants';
import BaseFavoriteCreationModal from '../baseFavoriteCreationModal/BaseFavoriteCreationModal';

const CreateFavoriteSetModal: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const metrics = useGlobalMetrics('favorites');
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { mutateAsync: mutateUpdateFavoriteContent } =
    useFavoriteUpdateContent();

  const { mutateAsync: mutateCreateFavourite } = useFavoritesCreateMutate();

  const isCreateModalOpen = useIsCreateFavoriteModalOpenSelector();
  const itemsToAddAfterFavoriteCreation =
    useItemsToAddAfterFavoriteCreationSelector();

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
  };

  const handleOnConfirm = () => {
    metrics.track('click-confirm-create-set-button');
    createFavorite();
  };

  const createFavorite = () => {
    mutateCreateFavourite({
      name: name.trim(),
      description: description?.trim() || undefined,
    })
      .then((res: any) => {
        showSuccessMessage('Favorite set created');
        if (itemsToAddAfterFavoriteCreation) {
          mutateUpdateFavoriteContent({
            id: res,
            updateData: {
              addDocumentIds: itemsToAddAfterFavoriteCreation?.documentIds,
              wells: itemsToAddAfterFavoriteCreation?.wells,
            },
          }).then(() => {
            showSuccessMessage(t(NOTIFICATION_MESSAGE));
            dispatch(setItemsToAddAfterFavoriteIsCreated(undefined));
          });
        }
      })
      .catch((error) => {
        reportException(error);
        showErrorMessage('Something went wrong');
      });

    dispatch(hideCreateFavoriteModal());
    clearState();
  };

  const handleOnClose = () => {
    metrics.track('click-cancel-create-set-button');

    clearState();
    dispatch(hideCreateFavoriteModal());
    dispatch(setItemsToAddAfterFavoriteIsCreated(undefined));
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
      showShareOptions={false}
    />
  );
};

export default CreateFavoriteSetModal;
