import { useEffect, useState } from 'react';
import { Title, Row, Button, Flex } from '@cognite/cogs.js';
import { StyledPageWrapper } from '../styles/SharedStyles';

import services from './di';
import { useTranslation } from '../../hooks/useTranslation';
import { Result, Solution } from '@platypus/platypus-core';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { SolutionCard } from '@platypus-app/components/SolutionCard/SolutionCard';
import { StyledSolutionListWrapper } from './elements';

export const SolutionsList = () => {
  const [solutions, setSolutions] = useState<Array<Solution>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation('solutions');

  useEffect(() => {
    const solutionsHandler = services.solutionsHandler;
    const listSolutions = () => {
      solutionsHandler.list().then((res: Result<Solution[]>) => {
        setLoading(false);
        setSolutions(res.getValue());
      });
    };
    listSolutions();
  }, []);

  if (loading) {
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
        <Title level={4}>No solutions yet.</Title>
        <br />
        Design for the empty list of solutions needs to be updated...
      </div>
    );
  };

  return (
    <StyledSolutionListWrapper>
      <Flex justifyContent="space-between" className="header">
        <Title level={3}>{t('solutions_title', 'Solutions')}</Title>
        <Button>Create solution</Button>
      </Flex>
      <div className="solutions">
        {solutions.length ? renderList() : renderEmptyList()}
      </div>
    </StyledSolutionListWrapper>
  );
};
