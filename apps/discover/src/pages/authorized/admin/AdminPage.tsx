import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import { Switch } from 'react-router-dom';

import { SIDECAR } from 'constants/app';
import navigation from 'constants/navigation';

import { ProtectedRoute } from '../../../core';

import FeedbackPage from './feedback';
import { MapConfig } from './mapConfig';
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
        path={navigation.ADMIN_PROJECT_CONFIG}
        render={() => <ProjectConfig />}
      />

      {SIDECAR.useFDMConfig && (
        <ProtectedRoute
          isAuthenticated={isAuthenticated}
          returnPath="/"
          path={navigation.ADMIN_MAP_CONFIG}
          render={() => <MapConfig />}
        />
      )}

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
