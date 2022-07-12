import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import Map from 'components/Map';
import env from 'utils/config';
import { ErrorDisplay } from 'components/ErrorDisplay';
import { useSetNodeIdInURL } from 'hooks/useSetNodeIdInURL';

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  const setNodeIdInUrl = useSetNodeIdInURL();

  const model = env.projectModels[project];

  // fix later for displaying clearer error message
  if (!model || !client)
    return (
      <ErrorDisplay>
        Error loading the 3D model. Perhaps this project is not configured or
        there is something wrong with your client
      </ErrorDisplay>
    );

  return <Map client={client} model={model} setNodeIdInUrl={setNodeIdInUrl} />;
};
