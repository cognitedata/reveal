import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import { AvatarButton } from 'components/AvatarButton/AvatarButton';
import { AbsoluteHeader } from 'components/Header';
import Map from 'components/Map';
import { NavigateToSearchButton } from 'components/SearchBar';
import { Link } from 'react-router-dom';
import { PAGES } from 'pages/routers/constants';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();
  return (
    <>
      <AbsoluteHeader Left={renderLeftHeader}>
        <Link to={PAGES.PROFILE}>
          <AvatarButton />
        </Link>
      </AbsoluteHeader>
      <Map client={client!} project={project} />
    </>
  );
};
