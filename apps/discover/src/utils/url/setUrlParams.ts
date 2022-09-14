import { useHistory } from 'react-router-dom';

export const useSetUrlParams = () => {
  const history = useHistory();

  return (search: string) =>
    history.replace({
      search,
    });
};
