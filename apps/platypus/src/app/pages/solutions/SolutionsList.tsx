import { useEffect, useState, useCallback } from 'react';
import { Title, Row, Flex, Checkbox } from '@cognite/cogs.js';
import { StyledPageWrapper } from '../styles/SharedStyles';

import services from './di';
import { useTranslation } from '../../hooks/useTranslation';
import { Result, Solution } from '@platypus/platypus-core';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { SolutionCard } from '@platypus-app/components/SolutionCard/SolutionCard';
import { StyledSolutionListWrapper } from './elements';

export const SolutionsList = () => {
  const [solutions, setSolutions] = useState<Array<Solution>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteSolution, setDeleteSolution] = useState<Solution | undefined>(
    undefined
  );
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const { t } = useTranslation('solutions');

  const solutionsHandler = services.solutionsHandler;

  const listSolutions = useCallback(() => {
    setLoading(true);
    solutionsHandler.list().then((res: Result<Solution[]>) => {
      setLoading(false);
      setSolutions(res.getValue());
    });
  }, [solutionsHandler]);

  useEffect(() => {
    listSolutions();
  }, [listSolutions]);

  if (loading) {
    return (
      <StyledPageWrapper>
        <Spinner />
      </StyledPageWrapper>
    );
  }

  const renderDeleteModal = () => {
    return (
      <ModalDialog
        visible={deleteSolution ? true : false}
        title={t('delete_solution', 'Delete solution')}
        onCancel={() => {
          setDeleteSolution(undefined);
          setConfirmDelete(false);
        }}
        onOk={() => deleteSolution && onDeleteSolution(deleteSolution.id)}
        okDisabled={!confirmDelete}
        okButtonName={t('delete', 'Delete')}
        okProgress={deleting}
      >
        <div>
          {t(
            'are_you_sure_to_delete_solution_1',
            'Are you sure you want to delete «'
          )}
          <strong>{deleteSolution?.name}</strong>
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
            {t(
              'yes_sure_to_delete_solution',
              'Yes, I’m sure I want to delete this solution.'
            )}
          </div>
        </div>
      </ModalDialog>
    );
  };

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
          type: 'success',
          message: t(
            'success_solution_deleted',
            'The solution was successfully deleted.'
          ),
        });
        setDeleteSolution(undefined);
        listSolutions();
      }
      setDeleting(false);
    });
  };

  const renderList = () => {
    return (
      <Row cols={3} gutter={20} style={{ margin: '0 auto' }}>
        {solutions.map((solution) => (
          <SolutionCard
            solution={solution}
            onDelete={(solutionToDelete) => setDeleteSolution(solutionToDelete)}
            key={solution.id}
          />
        ))}
      </Row>
    );
  };

  const renderEmptyList = () => {
    return (
      <div className="emptyList">
        <Title level={4}>{t('no_solution', 'No solutions yet.')}</Title>
        <br />
        (WIP) Design for the empty list of solutions needs to be updated...
      </div>
    );
  };

  return (
    <StyledSolutionListWrapper>
      <Flex justifyContent="space-between" className="header">
        <Title level={3}>{t('solutions_title', 'Solutions')}</Title>
      </Flex>
      <div className="solutions">
        {solutions.length ? renderList() : renderEmptyList()}
      </div>
      {renderDeleteModal()}
    </StyledSolutionListWrapper>
  );
};
