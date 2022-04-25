import { Switch } from 'react-router-dom';

import navigation from 'constants/navigation';

import { ProtectedRoute } from '../../../core';
import { useUserRoles } from '../../../services/user/useUserQuery';

import { CodeDefinitions } from './codeDefinitions/CodeDefinitions';
import FeedbackPage from './feedback';
import LayerPage from './layers';
import { ProjectConfig } from './projectConfig';

const AdminPage = () => {
  const { data: roles, isFetched } = useUserRoles();
  const isAuthenticated = !!roles && roles.isAdmin;

  if (!isFetched) {
    return null;
  }

  return (
    <Switch>
      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        returnPath="/"
        path={navigation.ADMIN_FEEDBACK}
        render={() => <FeedbackPage />}
      />

      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        returnPath="/"
        path={navigation.ADMIN_LAYERS}
        render={() => <LayerPage />}
      />

      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        returnPath="/"
        path={navigation.ADMIN_PROJECT_CONFIG}
        render={() => <ProjectConfig />}
      />

      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        returnPath="/"
        path={navigation.ADMIN_LEGEND}
        render={() => <CodeDefinitions />}
      />

      {/* fallback, should be last: */}
      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        returnPath="/"
        path={navigation.ADMIN}
        render={() => <FeedbackPage />}
      />
    </Switch>
  );
};

export default AdminPage;
