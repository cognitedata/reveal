import React, { FunctionComponent } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { createIntegrationRoutes } from '../../routing/CreateRouteConfig';

interface CreateProps {}

const Create: FunctionComponent<CreateProps> = () => {
  const { path: rootPath } = useRouteMatch();
  return (
    <>
      {createIntegrationRoutes.map(({ path, name, component, exact }) => {
        return (
          <Route
            exact={exact}
            key={name}
            path={`${rootPath}${path}`}
            component={component}
          />
        );
      })}
    </>
  );
};
export default Create;
