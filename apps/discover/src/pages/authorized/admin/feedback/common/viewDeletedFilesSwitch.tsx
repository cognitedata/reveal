/**
 * For the next one touching this file:
 * rename this to 'ViewArchivedFeedback'
 *
 * If this file is touched without doing this, don't approve the PR
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Button } from '@cognite/cogs.js';

import {
  toggleGeneralFeedbackDeleted,
  toggleObjectFeedbackDeleted,
} from 'modules/feedback/actions';

import { useFeedback } from '../Selector';

export const ViewDeletedFilesSwitch: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Admin');
  const { generalFeedbackShowDeleted } = useFeedback();

  const toggleShowDeleted = () => {
    // Ideally this would be one action, needs a bigger refactor to do so.
    dispatch(toggleGeneralFeedbackDeleted());
    dispatch(toggleObjectFeedbackDeleted());
  };

  return (
    <Button toggled={generalFeedbackShowDeleted} onClick={toggleShowDeleted}>
      {t('View archived')}
    </Button>
  );
};
