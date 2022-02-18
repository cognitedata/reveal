import { ActionStatus } from '@platypus-app/types';
import React from 'react';
import styled from 'styled-components/macro';
import configureStory from '@platypus-app/tests/configureStorybook';
import { SolutionsList } from './SolutionsList';

const Wrapper = styled.div`
  display: flex;
  background-color: white;
  height: 400px;
  position: relative;
`;

export default {
  title: 'Solutions/SolutionsList',
};

export const Base = () => {
  return (
    <Wrapper>
      <SolutionsList />
    </Wrapper>
  );
};

Base.story = configureStory({
  redux: {
    solutions: {
      solutions: [
        {
          id: '1',
          name: 'BestDay',
          description: 'This is an very good app',
          createdTime: 1636107405779,
          updatedTime: 1636107405779,
          owners: ['Ola Nordmann'],
          version: '1.2',
        },
        {
          id: '2',
          name: 'Equipments',
          description: 'Required assets.',
          createdTime: 1636107405779,
          updatedTime: 1636107405779,
          owners: [],
          version: '1.0',
        },
      ],
      solutionsStatus: ActionStatus.SUCCESS,
    },
  },
});
