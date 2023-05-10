import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { search } = useLocation(); // <-- current location being accessed
  const params = useParams();

  const toSearchPage = (query?: string) => {
    navigate({
      pathname: `search`,
      search: `?searchQuery=${query}`,
    });
  };

  const toHomePage = (space: string, dataModel: string, version: string) => {
    navigate({
      pathname: `/${space}/${dataModel}/${version}`,
    });
  };

  const redirectSearchPage = (
    space: string,
    dataModel: string,
    version: string
  ) => {
    navigate(
      { pathname: `${space}/${dataModel}/${version}/search`, search },
      { replace: true }
    );
  };

  const toInstancePage = (dataType: string, externalId: string) => {
    const { space, dataModel, version } = params;
    navigate({
      pathname: `/${space}/${dataModel}/${version}/${dataType}/${externalId}`,
      search,
    });
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
    toHomePage,
    redirectSearchPage,

    toInstancePage,
    goBack,
  };
};
