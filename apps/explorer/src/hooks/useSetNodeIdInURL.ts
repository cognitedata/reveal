import { HOME_ROUTES } from 'pages/constants';
import { useHistory } from 'react-router-dom';

export const useSetNodeIdInURL = () => {
  const history = useHistory();

  const setNodeIdInURL = (nodeId: number | undefined) => {
    // Note: We cannot use useURLSearchParams here as it does not correctly read the state for some reason
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (nodeId) {
      if (history.location.pathname === HOME_ROUTES.HOME_NAVIGATE_SET_SRC) {
        urlSearchParams.set('from', String(nodeId));
        history.replace({
          pathname: HOME_ROUTES.HOME_NAVIGATE,
          search: `?${urlSearchParams.toString()}`,
        });
      } else if (
        history.location.pathname === HOME_ROUTES.HOME_NAVIGATE_SET_DEST
      ) {
        urlSearchParams.set('to', String(nodeId));
        history.replace({
          pathname: HOME_ROUTES.HOME_NAVIGATE,
          search: `?${urlSearchParams.toString()}`,
        });
      } else {
        history.replace({ search: `?to=${nodeId}` });
      }
    } else {
      history.replace({
        search: '',
      });
    }
  };

  return setNodeIdInURL;
};
