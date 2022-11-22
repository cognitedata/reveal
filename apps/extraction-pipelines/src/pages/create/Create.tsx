import React, { FunctionComponent } from 'react';
import { Route } from 'react-router-dom';
import { createExtpipeRoutes } from 'routing/CreateRouteConfig';
import { RegisterExtpipeProvider } from 'hooks/useStoredRegisterExtpipe';

interface CreateProps {}

const Create: FunctionComponent<CreateProps> = () => {
  return (
    <>
      <RegisterExtpipeProvider>
        {createExtpipeRoutes.map(({ path, name, component }) => {
          return <Route key={name} path={path} element={component} />;
        })}
      </RegisterExtpipeProvider>
    </>
  );
};
export default Create;
