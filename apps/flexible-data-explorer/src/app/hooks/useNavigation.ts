import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { search } = useLocation(); // <-- current location being accessed
  const params = useParams();

  const toSearchPage = useCallback(
    (query?: string) => {
      navigate({
        pathname: `search`,
        search: `?searchQuery=${query}`,
      });
    },
    [navigate]
  );

  const toListPage = useCallback(
    (dataType: string) => {
      navigate({
        pathname: `list/${dataType}`,
        // search: `?searchQuery=${query}`,
      });
    },
    [navigate]
  );

  const toHomePage = useCallback(
    (space: string, dataModel: string, version: string) => {
      navigate({
        pathname: `/${dataModel}/${space}/${version}`,
      });
    },
    [navigate]
  );

  // const redirectSearchPage = (
  //   space: string,
  //   dataModel: string,
  //   version: string
  // ) => {
  //   navigate(
  //     { pathname: `${space}/${dataModel}/${version}/search`, search },
  //     { replace: true }
  //   );
  // };

  const toInstancePage = (
    dataType: string,
    nodeSpace: string,
    externalId: string
  ) => {
    const { space, dataModel, version } = params;
    navigate({
      pathname: `/${dataModel}/${space}/${version}/${dataType}/${nodeSpace}/${externalId}`,
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
    toListPage,
    toHomePage,

    toInstancePage,
    goBack,
  };
};
