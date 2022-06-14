import styled from 'styled-components';
import { useAuthContext, getProjectInfo } from '@cognite/react-container';
import { AvatarButton } from 'components/AvatarButton/AvatarButton';
import { AbsoluteHeader } from 'components/Header';
import Map from 'components/Map';
import { NavigateToSearchButton } from 'components/SearchBar';
import { Link } from 'react-router-dom';
import { PAGES } from 'pages/routers/constants';
import env from 'utils/config';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const ErrorWrapper = styled.header`
  font-size: 22px;
  color: #ba3939;
  background: #ffe0e0;
  border: 1px solid #a33a3a;
  padding: 10px;
  margin: 10px;
`;

export const Home = () => {
  const { client } = useAuthContext();
  const [project] = getProjectInfo();

  const model = env.projectModels[project];
  if (!model) {
    return (
      <ErrorWrapper>
        Error loading the 3D model. Perhaps this project is not configured yet.
      </ErrorWrapper>
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
