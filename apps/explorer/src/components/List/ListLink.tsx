import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import { HOME_ROUTES, PAGES } from 'pages/constants';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  id: string;
  type: string;
}

export const ListLink: React.FC<React.PropsWithChildren<Props>> = ({
  id,
  type,
  children,
}) => {
  const location = useLocation();
  const urlSearchParams = useGetURLSearchParams();

  let url;
  if (location.pathname === HOME_ROUTES.HOME_NAVIGATE_SET_SRC) {
    urlSearchParams.set('from', id);
    urlSearchParams.set('fromType', type);
    url = `${HOME_ROUTES.HOME_NAVIGATE}`;
  } else if (location.pathname === HOME_ROUTES.HOME_NAVIGATE_SET_DEST) {
    urlSearchParams.set('to', id);
    urlSearchParams.set('toType', type);
    url = `${HOME_ROUTES.HOME_NAVIGATE}`;
  } else {
    urlSearchParams.set('to', id);
    urlSearchParams.set('toType', type);
    url = `${PAGES.HOME}`;
  }

  url += `?${urlSearchParams.toString()}`;

  return <Link to={url}>{children}</Link>;
};
