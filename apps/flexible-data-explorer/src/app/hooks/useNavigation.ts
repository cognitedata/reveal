import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const toSearchPage = (query?: string) => {
    navigate({ pathname: '/search', search: `?searchQuery=${query}` });
  };

  const toInstancePage = (
    space: string,
    dataModel: string,
    dataType: string,
    externalId: string,
    version = 'latest'
  ) => {
    navigate(`/${space}/${dataModel}/${version}/${dataType}/${externalId}`);
  };

  const toLandingPage = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate('..');
  };

  return {
    toLandingPage,
    toSearchPage,

    toInstancePage,
    goBack,
  };
};
