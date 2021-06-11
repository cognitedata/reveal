import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import Layers from 'utils/zindex';
import {
  EXTRACTION_PIPELINE,
  EXTRACTION_PIPELINE_LOWER,
} from 'utils/constants';
import {
  EXTERNAL_ID_PAGE_PATH,
  NAME_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { TaskItem, TaskItemProps } from 'pages/create/TaskItem';

const Wrapper = styled.aside`
  grid-area: left;
`;
const List = styled.div`
  &.task-list {
    position: relative;
    margin: 0 auto;
    width: 90%;
    ul {
      display: block;
      list-style-type: disc;
      margin-block-start: 1rem;
      margin-block-end: 1rem;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 0;
    }
  }

  &.task-list ul li {
    margin-bottom: 1rem;
    list-style-type: none;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .point {
    min-width: 2rem;
    height: 2rem;
    border-radius: 100%;
    background-color: ${Colors.white.hex()};
    z-index: ${Layers.MINIMUM};
    position: relative;
    left: -0.9rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0.1875rem solid ${Colors['greyscale-grey3'].hex()};
    &.current {
      background: ${Colors.primary.hex()};
      border: 0.1875rem solid ${Colors.primary.hex()};
      color: ${Colors.white.hex()};
      @media (max-width: 800px) {
        color: transparent;
      }
    }
    &.done {
      border: 0.1875rem solid ${Colors.primary.hex()};
      @media (max-width: 800px) {
        color: transparent;
      }
    }
  }

  &.task-list ul li .content {
    width: 100%;
    padding: 0;
    border: none;
  }

  &.task-list ul li .content {
    padding-right: 0;
  }

  &.task-list ul li .content h3 {
    background-color: ${Colors.white.hex()};
    margin-bottom: 0;
    font-size: 1.1rem;
  }

  &.task-list ul li .content .task-list-main {
    display: flex;
    flex-direction: column;
    background-color: white;
    margin-top: 0;
  }

  &.task-list ul li {
    flex-direction: row-reverse;
    margin-bottom: 1rem;
  }

  &.task-list::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 0.1875rem;
    left: 0;
    background-color: ${Colors['greyscale-grey3'].hex()};
  }

  @media (max-width: 800px) {
    .point {
      min-width: 1rem;
      height: 1rem;
      left: -0.4rem;
      color: transparent;
    }
  }
`;
export const taskListItems: Omit<TaskItemProps, 'pointNumber'>[] = [
  {
    path: NAME_PAGE_PATH,
    title: `${EXTRACTION_PIPELINE} name`,
    description: `Define an ${EXTRACTION_PIPELINE_LOWER} name`,
    fieldName: 'name',
  },
  {
    path: EXTERNAL_ID_PAGE_PATH,
    title: 'External id',
    description: 'Register External Id',
    fieldName: 'externalId',
  },
];

interface TaskListProps {
  list: Omit<TaskItemProps, 'pointNumber'>[];
}

export const TaskList = ({ list }: TaskListProps) => {
  return (
    <Wrapper>
      <List className="task-list">
        <ul>
          {list.map(({ path, fieldName, title, description }, index) => {
            return (
              <TaskItem
                key={path}
                path={path}
                pointNumber={index + 1}
                fieldName={fieldName}
                title={title}
                description={description}
              />
            );
          })}
        </ul>
      </List>
    </Wrapper>
  );
};
