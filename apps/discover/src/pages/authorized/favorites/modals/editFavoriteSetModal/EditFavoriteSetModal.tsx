import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFavoritesUpdateMutate } from 'services/favorites/useFavoritesMutate';

import { reportException } from '@cognite/react-errors';

import { showErrorMessage } from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteMetadata, FavoriteSummary } from 'modules/favorite/types';
import BaseFavoriteCreationModal from 'pages/authorized/favorites/modals/baseFavoriteCreationModal/BaseFavoriteCreationModal';

import { EDIT_SET_MODAL_BUTTON_TEXT } from '../../constants';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  item: FavoriteSummary;
}

const EditFavoriteSetModal: React.FC<Props> = (props) => {
  const { isOpen, onCancel, item } = props;
  const { mutateAsync: mutateUpdateFavorite } = useFavoritesUpdateMutate();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const metrics = useGlobalMetrics('favorites');

  const { t } = useTranslation();

  useEffect(() => {
    setName(item.name);
    setDescription(item.description);
  }, [item]);

  const updateFavoriteMetadata = (updatedItem: FavoriteMetadata) => {
    mutateUpdateFavorite({
      id: item.id,
      updateData: {
        name: updatedItem.name,
        description: updatedItem.description,
      },
    }).catch((error) => {
      reportException(error);
      showErrorMessage('Something went wrong.');
    });
  };

  const handleTextChanged = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value } = event.target;

    if (field === 'name') setName(value);
    else if (field === 'description') setDescription(value);
  };

  const updateSet = () => {
    metrics.track('click-confirm-update-set-button');

    const updatedItem = {
      name: name?.trim(),
      description: description?.trim(),
    };

    if (name.trim() === '') {
      showErrorMessage('Name cannot be empty');
    } else {
      updateFavoriteMetadata(updatedItem);
      onCancel();
    }
  };

  const handleCancel = () => {
    metrics.track('click-cancel-update-set-button');
    onCancel();
  };

  return (
    <BaseFavoriteCreationModal
      isOpen={isOpen}
      item={item}
      title={t('Edit set')}
      okText={t(EDIT_SET_MODAL_BUTTON_TEXT)}
      name={name}
      description={description}
      handleOnConfirm={updateSet}
      handleTextChanged={handleTextChanged}
      handleOnClose={handleCancel}
      showShareOptions={false}
    />
  );
};

export default EditFavoriteSetModal;
