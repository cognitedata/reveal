import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useQueryParameter = (
  name: string
): [string, (value: string) => void] => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get(name);

  const [value, setValue] = useState<string>(paramValue || '');

  useEffect(() => {
    const updatedParams = new URLSearchParams(location.search);
    if (value) {
      updatedParams.set(name, value);
    } else {
      updatedParams.delete(name);
    }
    const newUrl = `${location.pathname}?${updatedParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [name, value, location.search, navigate, location.pathname]);

  return [value, setValue];
};
