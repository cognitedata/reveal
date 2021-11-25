import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Title, Flex, Button } from '@cognite/cogs.js';

import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { SolutionCard } from '@platypus-app/modules/solutions/components/SolutionCard/SolutionCard';
import useSelector from '@platypus-app/hooks/useSelector';
import { ActionStatus } from '@platypus-app/types';
import { Solution } from '@platypus/platypus-core';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';

import { StyledRow, StyledSolutionListWrapper } from '../elements';
import { useSolutions } from '../hooks/useSolutions';
import { SolutionsState } from '../redux/store';
import { DeleteSolution } from '../DeleteSolution';
import { CreateSolution } from '../CreateSolution';

export const SolutionsList = () => {
  const history = useHistory();
  const { t } = useTranslation('solutions');

  const [createSolution, setCreateSolution] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<
    Solution | undefined
  >(undefined);
  const { solutionsStatus, solutions } = useSelector<SolutionsState>(
    (state) => state.solutions
  );
  const { fetchSolutions } = useSolutions();

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  if (
    solutionsStatus === ActionStatus.IDLE ||
    solutionsStatus === ActionStatus.PROCESSING
  ) {
    return (
      <StyledPageWrapper>
        <Spinner />
      </StyledPageWrapper>
    );
  }

  const renderList = () => {
    return (
      <StyledRow cols={3} gutter={20} className="grid">
        {solutions.map((solution) => (
          <SolutionCard
            solution={solution}
            onEdit={(editSolution) => {
              history.push({
                pathname: `/solutions/${editSolution.id}`,
              });
            }}
            onDelete={(deleteSolution) => setSolutionToDelete(deleteSolution)}
            key={solution.id}
          />
        ))}
      </StyledRow>
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
        <Button onClick={() => setCreateSolution(true)}>
          {t('create_solution_btn', 'Create solution')}
        </Button>
      </Flex>
      {solutions.length ? renderList() : renderEmptyList()}
      <CreateSolution
        createSolution={createSolution}
        onCancel={() => setCreateSolution(false)}
      />
      <DeleteSolution
        solution={solutionToDelete}
        onCancel={() => setSolutionToDelete(undefined)}
        onAfterDeleting={() => fetchSolutions()}
      />
    </StyledSolutionListWrapper>
  );
};
