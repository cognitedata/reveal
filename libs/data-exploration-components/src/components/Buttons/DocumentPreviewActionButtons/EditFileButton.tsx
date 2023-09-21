import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { ResourceItem } from '../../../types';
export const EditFileButton = ({
  item: { id, type },
  onClick,
  isActive,
  filesAcl,
  annotationsAcl,
}: {
  item: ResourceItem;
  onClick: () => void;
  isActive: boolean;
  filesAcl: boolean;
  annotationsAcl: boolean;
}) => {
  const { t } = useTranslation();

  if (type !== 'file') {
    return null;
  }

  const writeAccess = filesAcl && annotationsAcl;
  const errors: string[] = [];

  if (!filesAcl) {
    errors.push(
      t('EDIT_FILE_ERROR', 'files:write is missing', { type: 'files' })
    );
  }
  if (!annotationsAcl) {
    errors.push(
      t('EDIT_FILE_ERROR', 'annotations:write is missing', {
        type: 'annotations',
      })
    );
  }

  if (isActive) {
    return null;
  }
  const tooltipContent = writeAccess ? (
    t('EDIT', 'Edit')
  ) : (
    <>
      <p>
        {t(
          'FILE_NO_WRITE_ACCESS',
          'You do not have the necessary permissions to edit this file. You need both annotations:write and files:write capabilities.'
        )}
      </p>
      <p>
        {t('ERRORS', 'Errors')}: {errors.join(` ${t('AND', 'and')} `)}.
      </p>
    </>
  );

  return (
    <Tooltip content={tooltipContent}>
      <Button
        icon="Edit"
        aria-label="edit"
        type="ghost"
        key={id}
        onClick={onClick}
        disabled={writeAccess ? false : true}
      />
    </Tooltip>
  );
};
