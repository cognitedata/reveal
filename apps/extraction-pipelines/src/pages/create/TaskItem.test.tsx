import { QueryClient } from 'react-query';
import React from 'react';
import { screen } from '@testing-library/react';
import { renderRegisterContext } from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import {
  EXTERNAL_ID_PAGE_PATH,
  NAME_PATH,
} from '../../routing/CreateRouteConfig';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `${NAME_PATH}`,
    initRegisterIntegration: {},
  };
  const title = 'External Id';
  const fieldName = 'externalId';
  const description = 'My description';
  const pointNumber = 1;
  test('Renders', () => {
    renderRegisterContext(
      <TaskItem
        description={description}
        pointNumber={pointNumber}
        path={EXTERNAL_ID_PAGE_PATH}
        title={title}
        fieldName={fieldName}
      />,
      {
        ...props,
        initRegisterIntegration: {},
      }
    );
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toEqual(title);
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText(pointNumber)).toBeInTheDocument();
  });
  test('Renders value when stored', () => {
    const externalId = 'some_external';
    renderRegisterContext(
      <TaskItem
        description={description}
        pointNumber={pointNumber}
        path={EXTERNAL_ID_PAGE_PATH}
        title={title}
        fieldName={fieldName}
      />,
      {
        ...{ ...props, route: EXTERNAL_ID_PAGE_PATH },
        initRegisterIntegration: { externalId },
      }
    );
    expect(screen.getByText(externalId)).toBeInTheDocument();
    expect(screen.queryByText(pointNumber)).not.toBeInTheDocument();
  });
});
