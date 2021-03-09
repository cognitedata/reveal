import { QueryClient } from 'react-query';
import { screen } from '@testing-library/react';
import React from 'react';
import { TaskList, taskListItems } from './TaskList';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import { NAME_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { renderRegisterContext } from '../../utils/test/render';

describe('TaskList', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create/name?env=greenfield';
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `/:tenant${NAME_PAGE_PATH}`,
    initRegisterIntegration: {},
  };
  test('Renders', () => {
    renderRegisterContext(<TaskList list={taskListItems} />, {
      ...props,
      initRegisterIntegration: {},
    });
    taskListItems.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  test('Displays filled values', () => {
    const registeredInfo = { name: 'This is my integration' };
    renderRegisterContext(<TaskList list={taskListItems} />, {
      ...props,
      initRegisterIntegration: registeredInfo,
    });

    const name = screen.getByText(registeredInfo.name);
    expect(name).toBeInTheDocument();
  });
});
