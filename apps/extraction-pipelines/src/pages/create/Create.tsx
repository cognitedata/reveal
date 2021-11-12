import React, { FunctionComponent } from 'react';
import { Route } from 'react-router-dom';
import { createExtpipeRoutes } from 'routing/CreateRouteConfig';
import { RegisterExtpipeProvider } from 'hooks/useStoredRegisterExtpipe';

interface CreateProps {}

const Create: FunctionComponent<CreateProps> = () => {
  return (
    <>
      <RegisterExtpipeProvider>
        {createExtpipeRoutes.map(({ path, name, component, exact }) => {
          return (
            <Route exact={exact} key={name} path={path} component={component} />
          );
        })}
      </RegisterExtpipeProvider>
    </>
  );
};
export default Create;
