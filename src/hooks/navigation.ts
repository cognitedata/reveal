import { useHistory } from 'react-router-dom';
import qs from 'query-string';
import { omit } from 'lodash';
import { getProject } from 'utils/tenant';

export const useSearchParam = (
  name: string,
  pushState = true
): [string | undefined, (s?: string) => void] => {
  const history = useHistory();
  const { location } = history;
  const search = qs.parse(location.search);
  let val = search[name];

  if (val && Array.isArray(val)) {
    [val] = val;
  }

  const setSearchParam = (newVal?: string) => {
    const newSearch = newVal
      ? {
          ...search,
          [name]: newVal,
        }
      : omit(search, name);

    history[pushState ? 'push' : 'replace']({
      pathname: location.pathname,
      search: qs.stringify(newSearch),
      hash: location.hash,
      state: location.state,
    });
  };
  return [val ? decodeURIComponent(val) : undefined, setSearchParam];
};

export const useNavigate = () => {
  const history = useHistory();
  const tenant = getProject(history.location.pathname);

  return (path: string, pushState = true) => {
    const newPath = `/${tenant}${path}`;

    history[
      pushState && newPath !== history.location.pathname ? 'push' : 'replace'
    ]({
      ...history.location,
      pathname: newPath,
    });
  };
};

export const useClearSearchParams = (
  keys: string[],
  pushState: boolean = true
) => {
  const history = useHistory();
  const { location } = history;
  const search = qs.parse(location.search);

  return () => {
    history[pushState ? 'push' : 'replace']({
      pathname: location.pathname,
      search: qs.stringify(omit(search, keys)),
      hash: location.hash,
      state: location.state,
    });
  };
};
