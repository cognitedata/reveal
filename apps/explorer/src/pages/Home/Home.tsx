import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import { AvatarButton } from 'components/AvatarButton';
import { AbsoluteHeader } from 'components/Header';
import { ErrorDisplay } from 'components/ErrorDisplay';
import Map from 'components/Map';
import { NavigateToSearchButton } from 'components/SearchBar';
import { Link } from 'react-router-dom';
import { PAGES } from 'pages/routers/constants';
import env from 'utils/config';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();

  const model = env.projectModels[project];
  if (!model) {
    return (
      <ErrorDisplay>
        Error loading the 3D model. Perhaps this project is not configured yet.
      </ErrorDisplay>
    );
  }

  return (
    <>
      <AbsoluteHeader Left={renderLeftHeader}>
        <Link to={PAGES.PROFILE}>
          <AvatarButton />
        </Link>
      </AbsoluteHeader>

      <Map client={client!} model={model} />
    </>
  );
};
