import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Button } from '@cognite/cogs.js';

import { toggleFeedbackDelete } from 'modules/feedback/actions';

import { useFeedback } from '../Selector';

export const ViewArchivedFeedback: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Admin');
  const { generalFeedbackShowDeleted } = useFeedback();

  const toggleShowDeleted = () => {
    dispatch(toggleFeedbackDelete());
  };

  return (
    <Button toggled={generalFeedbackShowDeleted} onClick={toggleShowDeleted}>
      {t('View archived')}
    </Button>
  );
};
