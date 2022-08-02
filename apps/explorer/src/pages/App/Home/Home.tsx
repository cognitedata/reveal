import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import Map from 'components/Map';
import env from 'utils/config';
import { ErrorDisplay } from 'components/ErrorDisplay';
import { useSetNodeIdInURL } from 'hooks/useSetNodeIdInURL';
import { MapOverlayRouter } from 'pages/MapOverlay/MapOverlayRouter';

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  const setNodeIdInUrl = useSetNodeIdInURL();

  const modelOptions = env.projectModels[project];

  // fix later for displaying clearer error message
  if (!modelOptions || !client)
    return (
      <ErrorDisplay>
        Error loading the 3D model. Perhaps this project is not configured or
        there is something wrong with your client
      </ErrorDisplay>
    );

  return (
    <>
      <MapOverlayRouter />
      <Map
        client={client}
        modelOptions={modelOptions}
        setNodeIdInUrl={setNodeIdInUrl}
      />
    </>
  );
};
