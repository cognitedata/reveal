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

  const toInstancePage = useCallback(
    (
      dataType: string,
      instanceSpace: string | undefined,
      externalId: string
    ) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `/${dataModel}/${space}/${version}/${dataType}/${instanceSpace}/${externalId}`,
        search,
      });
    },
    [navigate, params, search]
  );

  const toTimeseriesPage = useCallback(
    (externalId: string | number) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `/${dataModel}/${space}/${version}/timeseries/${externalId}`,
        search,
      });
    },
    [navigate, params, search]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate('..');
  }, [navigate]);

  return {
    toLandingPage,
    toSearchPage,
    toListPage,
    toHomePage,

    toInstancePage,
    toTimeseriesPage,
    goBack,
  };
};
