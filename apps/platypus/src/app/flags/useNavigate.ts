import {
  To,
  NavigateOptions,
  useNavigate as origUseNavigate,
} from 'react-router';
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
    if (typeof to === 'string') {
      origNavigate((newToUrl || '/') + window.location.search, options);
    } else {
      origNavigate({ ...to, pathname: newToUrl }, options);
    }
  };
};
