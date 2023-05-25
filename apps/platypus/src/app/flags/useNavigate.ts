import {
  To,
  NavigateOptions,
  useNavigate as origUseNavigate,
} from 'react-router-dom';
import queryString from 'query-string';
import { isFDMv3 } from './isFDMv3';

export const useNavigate = () => {
  const origNavigate = origUseNavigate();
  return (to: To, options?: NavigateOptions) => {
    const fdmV3Path = isFDMv3() ? 'data-models' : 'data-models-previous';
    let newToUrl = typeof to === 'string' ? to : to.pathname;
    if (newToUrl) {
      newToUrl = `/${fdmV3Path}${
        newToUrl.startsWith('/') ? '' : '/'
      }${newToUrl}`;
    }
    const { url, query: params } = queryString.parseUrl(newToUrl || '/');
    if (typeof to === 'string') {
      origNavigate(
        `${url}?${queryString.stringify({
          ...queryString.parse(window.location.search),
          ...params,
        })}`,
        options
      );
    } else {
      origNavigate({ ...to, pathname: newToUrl }, options);
    }
  };
};
