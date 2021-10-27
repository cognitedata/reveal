import { Title, Detail, Body, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { solutions } from '../../mocks/solutions';
import { StyledPageWrapper } from '../styles/SharedStyles';

export const SolutionsList = () => {
  const history = useHistory();

  return (
    <StyledPageWrapper>
      <Title level={3}>Solutions</Title>
      <StyledWrapper>
        <StyledNewCard onClick={() => history.push('/new')}>
          <Icon type="PlusCompact" />
          <Body level={2}>Create a solution</Body>
        </StyledNewCard>
        {solutions.map((solution) => (
          <StyledSolutionCard
            onClick={() => history.push(`solutions/${solution.id}`)}
          >
            <Title level={4}>{solution.name}</Title>
            <Detail>Edited on {solution.lastEditedAt}</Detail>
            <Body level={2}>relevant info</Body>
            <StyledMoreActionsIcon type="MoreOverflowEllipsisHorizontal" />
          </StyledSolutionCard>
        ))}
      </StyledWrapper>
    </StyledPageWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  height: 116px;
  width: 325px;
  border-radius: 16px;
  padding: 16px 16px 20px 16px;
  box-sizing: border-box;
  margin: 0 20px 20px 0;

  :hover {
    cursor: pointer;
  }
`;

const StyledNewCard = styled(Card)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: var(--cogs-midblue-8);
  border: 2px dashed var(--cogs-midblue-5);
  color: var(--cogs-midblue-3);

  .cogs-body-2 {
    margin-left: 1rem;
    color: var(--cogs-midblue-3);
  }
`;

const StyledSolutionCard = styled(Card)`
  border: 1px solid var(--cogs-greyscale-grey2);
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);

  .cogs-body-2 {
    margin-top: 2rem;
  }
`;

const StyledMoreActionsIcon = styled(Icon)`
  position: absolute;
  margin-left: 26.5rem;
`;
