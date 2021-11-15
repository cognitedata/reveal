import { useEffect } from 'react';
import { Title, Row, Flex } from '@cognite/cogs.js';
import { StyledPageWrapper } from '../styles/SharedStyles';

import { useTranslation } from '../../hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { SolutionCard } from '@platypus-app/components/SolutionCard/SolutionCard';
import { StyledSolutionListWrapper } from './elements';
import { useSolutions } from './hooks/useSolutions';
import useSelector from '@platypus-app/hooks/useSelector';
import { ActionStatus } from '@platypus-app/types';

export const SolutionsList = () => {
  const { t } = useTranslation('solutions');
  const { solutionsStatus, solutions } = useSelector(
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
      <Row cols={3} gutter={20} style={{ margin: '0 auto' }}>
        {solutions.map((solution) => (
          <SolutionCard solution={solution} key={solution.id} />
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
    </StyledSolutionListWrapper>
  );
};
