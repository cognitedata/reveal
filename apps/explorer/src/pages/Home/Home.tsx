import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import { AvatarButton } from 'components/AvatarButton/AvatarButton';
import { Header } from 'components/Header';
import Map from 'components/Map';
import { NavigateToSearchButton } from 'components/SearchBar';
import { Link } from 'react-router-dom';
import { PAGES } from 'pages/routers/AppRouter';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  return (
    <>
      <Header Left={renderLeftHeader}>
        <Link to={PAGES.PROFILE}>
          <AvatarButton />
        </Link>
      </Header>
      <Map client={client!} project={project} />
    </>
  );
};
