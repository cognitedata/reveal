import { useState } from 'react';
import { Checkbox } from '@cognite/cogs.js';

import { Solution } from '@platypus/platypus-core';

import { Notification } from '@platypus-app/components/Notification/Notification';

import { useTranslation } from '../../hooks/useTranslation';
import services from '@platypus-app/di';
import { StyledModalDialog } from './elements';

export const DeleteSolution = ({
  solution,
  onCancel,
  onAfterDeleting,
}: {
  solution: Solution | undefined;
  onCancel: VoidFunction;
  onAfterDeleting: VoidFunction;
}) => {
  const { t } = useTranslation('solutions');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const solutionsHandler = services().solutionHandler;

  const onDeleteSolution = (solutionId: string) => {
    setDeleting(true);
    solutionsHandler.delete({ id: solutionId }).then((result) => {
      if (result.error) {
        Notification({
          type: 'error',
          message: result.error.name,
        });
      } else {
        Notification({
          type: 'info',
          message: t(
            'success_solution_deleted',
            `Solution «${solution?.name}» was deleted.`
          ),
        });
        onCancel();
        onAfterDeleting();
      }
      setDeleting(false);
    });
  };

  return (
    <StyledModalDialog
      visible={solution ? true : false}
      title={t('delete_solution', 'Delete solution')}
      onCancel={() => {
        onCancel();
        setConfirmDelete(false);
      }}
      onOk={() => solution && onDeleteSolution(solution.id)}
      okDisabled={!confirmDelete}
      okButtonName={t('delete', 'Delete')}
      okProgress={deleting}
      okType="danger"
    >
      <div>
        {t(
          'are_you_sure_to_delete_solution_1',
          'Are you sure you want to delete «'
        )}
        <strong>{solution?.name}</strong>
        {t(
          'are_you_sure_to_delete_solution_2',
          '»? You will lose all of the data, and will not be able to restore it later.'
        )}
        <div className="confirmDelete">
          <Checkbox
            name="ConfirmDelete"
            checked={confirmDelete}
            onChange={() => setConfirmDelete(!confirmDelete)}
          />{' '}
          <span
            onClick={() => setConfirmDelete(!confirmDelete)}
            className="confirmDeleteText"
          >
            {t(
              'yes_sure_to_delete_solution',
              'Yes, I’m sure I want to delete this solution.'
            )}
          </span>
        </div>
      </div>
    </StyledModalDialog>
  );
};
