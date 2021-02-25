import { useHistory } from 'react-router-dom';

export function useLink() {
  const history = useHistory();
  return {
    createLink: (pathname: string) => {
      const { location } = window;
      const baseUrl = `${location.protocol}//${location.host}`;
      const path = history.createHref({ pathname });
      return `${baseUrl}${path}`;
    },
  };
}
