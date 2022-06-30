import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import Map from 'components/Map';
import env from 'utils/config';
import { ErrorDisplay } from 'components/ErrorDisplay';
import { MapOverlay } from 'components/MapOverlay/MapOverlay';
import { useHistory } from 'react-router-dom';

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  const history = useHistory();
  const model = env.projectModels[project];

  const setDestination = (treeNodeId: number | undefined) => {
    if (treeNodeId) {
      history.push(`?to=${treeNodeId}`);
    } else {
      history.replace({
        search: '',
      });
    }
  };

  // fix later for displaying clearer error message
  if (!model)
    return (
      <ErrorDisplay>
        Error loading the 3D model. Perhaps this project is not configured yet
      </ErrorDisplay>
    );

  return (
    <>
      <MapOverlay />
      <Map client={client!} model={model} setDestination={setDestination} />
    </>
  );
};
