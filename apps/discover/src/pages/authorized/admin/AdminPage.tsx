import { Switch, Route } from 'react-router-dom';

import { Admin } from 'components/admin';
import navigation from 'constants/navigation';

import FeedbackPage from './feedback';
import LayerPage from './layers';
import { ProjectConfig } from './projectConfig';

const AdminPage = () => {
  return (
    <Admin>
      <Switch>
        <Route
          path={navigation.ADMIN_FEEDBACK}
          render={() => <FeedbackPage />}
        />
        <Route path={navigation.ADMIN_LAYERS} render={() => <LayerPage />} />

        <Route
          path={navigation.ADMIN_PROJECT_CONFIG}
          render={() => <ProjectConfig />}
        />

        {/* fallback, should be last: */}
        <Route path={navigation.ADMIN} render={() => <FeedbackPage />} />
      </Switch>
    </Admin>
  );
};

export default AdminPage;
