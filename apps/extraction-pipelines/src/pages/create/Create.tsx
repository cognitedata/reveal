import React, { FunctionComponent } from 'react';
import { Route } from 'react-router-dom';
import { createIntegrationRoutes } from '../../routing/CreateRouteConfig';
import { RegisterIntegrationProvider } from '../../hooks/useStoredRegisterIntegration';

interface CreateProps {}

const Create: FunctionComponent<CreateProps> = () => {
  return (
    <>
      <RegisterIntegrationProvider>
        {createIntegrationRoutes.map(({ path, name, component, exact }) => {
          return (
            <Route exact={exact} key={name} path={path} component={component} />
          );
        })}
      </RegisterIntegrationProvider>
    </>
  );
};
export default Create;
