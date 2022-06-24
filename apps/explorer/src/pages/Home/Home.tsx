import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import Map from 'components/Map';
import env from 'utils/config';
import { ErrorDisplay } from 'components/ErrorDisplay';
import { MapOverlay } from 'components/MapOverlay/MapOverlay';
import { useSearchPeopleRoomsQuery } from 'graphql/generated';

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  const { data, error } = useSearchPeopleRoomsQuery();
  const model = env.projectModels[project];

  // fix later for displaying clearer error message
  if (!model || error)
    return (
      <ErrorDisplay>
        Error loading the 3D model. Perhaps this project is not configured yet
      </ErrorDisplay>
    );

  return (
    <>
      <MapOverlay data={data || {}} />
      <Map client={client!} model={model} />
    </>
  );
};
