import React, { useState, useEffect } from 'react';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { FavoriteSummary } from 'modules/favorite/types';

import {
  DUPLICATED_SET_SUFFIX,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
} from '../../constants';
import BaseFavoriteCreationModal from '../baseFavoriteCreationModal';

interface Props {
  item?: Omit<FavoriteSummary, 'id' | 'owner' | 'members' | 'isOwner'>;
  onConfirm: (state: { name: string; description?: string }) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const DuplicateFavoriteSetModal: React.FC<Props> = (props) => {
  const { item, onConfirm, onCancel, isOpen } = props;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const metrics = useGlobalMetrics('favorites');

  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      setName(`${item.name}${DUPLICATED_SET_SUFFIX}` || '');
      setDescription(item.description || '');
    }
  }, [item]);

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
    metrics.track('click-confirm-duplicate-set-button');

    const state = {
      description: description || undefined,
      name,
    };
    onConfirm(state);
    clearState();
  };

  const handleOnClose = () => {
    metrics.track('click-cancel-duplicate-set-button');

    clearState();
    onCancel();
  };

  return (
    <BaseFavoriteCreationModal
      isOpen={isOpen}
      item={item as FavoriteSummary}
      title={t('Duplicate set')}
      name={`${name}`}
      okText={DUPLICATE_SET_MODAL_BUTTON_TEXT}
      description={description}
      handleTextChanged={handleTextChanged}
      handleOnConfirm={handleOnConfirm}
      handleOnClose={handleOnClose}
    />
  );
};

export default DuplicateFavoriteSetModal;
