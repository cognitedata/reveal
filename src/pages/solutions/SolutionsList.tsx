import React from 'react';
import { Title, Detail, Body, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const solutions = [
  {
    id: 0,
    name: 'BestDay',
    lastEditedAt: '02.05.2021',
  },
  {
    id: 1,
    name: 'InField',
    lastEditedAt: '02.05.2021',
  },
  {
    id: 2,
    name: 'Solution',
    lastEditedAt: '02.05.2021',
  },
  {
    id: 3,
    name: 'Another solution',
    lastEditedAt: '02.05.2021',
  },
  {
    id: 4,
    name: 'Yet another solution',
    lastEditedAt: '02.05.2021',
  },
];

export const SolutionsList = () => {
  const history = useHistory();

  return (
    <Wrapper>
      <NewCard onClick={() => history.push('/new')}>
        <Icon type="PlusCompact" />
        <Body level={2}>Create a solution</Body>
      </NewCard>
      {solutions.map((solution) => (
        <SolutionCard onClick={() => history.push(`solutions/${solution.id}`)}>
          <Title level={4}>{solution.name}</Title>
          <Detail>Edited on {solution.lastEditedAt}</Detail>
          <Body level={2}>relevant info</Body>
          <MoreActionsIcon type="MoreOverflowEllipsisHorizontal" />
        </SolutionCard>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  margin-top: 3rem;
  flex-wrap: wrap;
  align-content: flex-start;
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

const NewCard = styled(Card)`
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

const SolutionCard = styled(Card)`
  border: 1px solid var(--cogs-greyscale-grey2);
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);

  .cogs-body-2 {
    margin-top: 2rem;
  }
`;

const MoreActionsIcon = styled(Icon)`
  position: absolute;
  margin-left: 26.5rem;
`;
